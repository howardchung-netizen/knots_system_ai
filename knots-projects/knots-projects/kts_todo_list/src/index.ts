import http from 'http';
import { ApolloServer, ForbiddenError } from 'apollo-server-express';
import { graphqlUploadExpress } from 'graphql-upload';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import { printError } from 'graphql';
import morgan from 'morgan';
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';
import { PubSub, PubSubEngine } from 'graphql-subscriptions';
import { Container } from 'typedi';
import { getRepository, useContainer } from 'typeorm';
import "reflect-metadata";
import { User } from "./modules/user/user.entity";
import { authChecker } from './lib/authChecker';
import { cors, resolverPaths, TOKEN_COOKIE_NAME, PORT, REDIS_URL, ADMIN_URL, FIREBASE_KEY_PATH, START_CRON } from "./lib/config";
import { logger, loggerStream } from "./lib/logger";
import { jwt } from './lib/jwt';
import { createLoaders } from './lib/loader';
import {boolean} from 'boolean';
import {Crons} from './lib/cron';
import {createDbConnection} from './db';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';
import { ServiceAccount } from './modules/serviceAccount/serviceAccount.entity';
import {i18next} from './lib/i18next';
import { TaskController } from './modules/task/task.controller';
import { GanttController } from './modules/gantt/gantt.controller';
import Cors from 'cors';
import { ClockInController } from './modules/clockIn/clockIn.controller';
import { FileController } from './modules/file/file.controller';
import admin from 'firebase-admin';
import { UserNotificationMessageController } from './modules/userNotificationMessage/userNotificationMessage.controller';

admin.initializeApp({
  credential: admin.credential.cert(FIREBASE_KEY_PATH),
});

async function main() {

  useContainer(Container);

  const pubSub: PubSubEngine = REDIS_URL ? new RedisPubSub({
    publisher: new Redis(REDIS_URL),
    subscriber: new Redis(REDIS_URL),
    reviver: (key, value) => {
      const isISO8601Z = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/;
      if (typeof value === 'string' && isISO8601Z.test(value)) {
        const tempDateNumber = Date.parse(value);
        if (!isNaN(tempDateNumber)) {
          return new Date(tempDateNumber);
        }
      }
      return value;
    },
  }) : new PubSub();
  Container.set('pubSub', pubSub);

  const enforcer = await createDbConnection();

  const app = express()
    .enable('trust proxy')
    .use(morgan('short', { stream: loggerStream }))
    .use(cookieParser())
    .use(express.json({limit: '10mb'}))
    .use(express.urlencoded({limit: '10mb'}))
    .use(graphqlUploadExpress())
    .use((req,res,next)=>{
      res.setHeader('Access-Control-Allow-Origin', ADMIN_URL);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      next();
    })
    // .use(locale(supportedLocales, defaultLocale))
    .use(async (req, res, next) => {
      const startTime = Date.now();

      if (req.cookies && req.cookies[TOKEN_COOKIE_NAME]) {
        req.headers['authorization'] = `Bearer ${req.cookies[TOKEN_COOKIE_NAME]}`;
      }

      function logRequest() {
        res.removeListener('finish', logRequest);
        res.removeListener('close', logRequest);

        const httpRequest = JSON.stringify({
          status: res.statusCode,
          requestUrl: req.originalUrl,
          requestSize: req.socket.bytesRead,
          responseSize: req.socket.bytesWritten,
          userAgent: req.headers['user-agent'],
          requestMethod: req.method,
          remoteIp: req.headers['x-forwarded-for'] || (req.connection && req.connection.remoteAddress),
          processTime: Date.now() - startTime,
          requestHeaders: req.headers,
          requestBody: req.body,
        });

        if (res.statusCode < 400) {
          logger.info(httpRequest);
        } else {
          logger.error(httpRequest);
        }
      }

      res.on('finish', logRequest);
      res.on('close', logRequest);

      next();
    })
    .use(jwt)
    .use((err: any, req: any, res: Response, next: NextFunction) => {
      if (err.name === 'UnauthorizedError') {
        if (err.message.indexOf('jwt expired') >= 0) {
          logger.warn(err);
          req.tokenError = new ForbiddenError('登入憑證已逾期，請重新登入。');
        } else {
          logger.error(err);
          req.tokenError = new ForbiddenError('登入憑證無效，請重新登入。');
        }
        next();
        return;
      }
      logger.error(err);
      next(err);
    });

    app.use(Cors(cors));

    i18next(app);
    const schema = await buildSchema({
    authChecker,
    container: Container,
    resolvers: [__dirname + resolverPaths],
    pubSub: pubSub,
  });
  const apolloServer = new ApolloServer({
    context: async ({ req, connection, res }: { req: any; connection: any; res: Response }) => {
      // clone request from context for subscription

      if (connection?.context?._req) req = connection.context._req;

      if (!!req?.tokenError) throw req.tokenError;

      let tokenPayload = req?.user;
      let user: User | undefined;
      let serviceAccount: ServiceAccount | undefined;

      if (tokenPayload?.id) {
        switch (tokenPayload.loginUserType) {
          case ServiceAccount.name:
            serviceAccount = await getRepository(ServiceAccount).findOne(tokenPayload.id);
            break;
          case User.name:
          default:
            user = await getRepository(User).findOne(tokenPayload.id);
        }
      }

      return {
        req,
        res,
        enforcer,
        user,
        serviceAccount,
        ...createLoaders(),
      };
    },
    introspection: true,
    playground: true,
    uploads: false,
    schema,
    formatError: error => {
      logger.error(printError(error));
      error.message = error.message.replace('Context creation failed: ', '');
      if ((error.originalError && error.originalError instanceof ForbiddenError) || error.message.startsWith('Access denied!')) {
        error.message = error.message === `Access denied! You don't have permission for this action!` ? '登入憑證權限不足，請重新登入。' : '登入憑證無效，請重新登入。';
        return new ForbiddenError(error.message);
      }

      return error;
    },
  });

  apolloServer.applyMiddleware({
    cors,
    app,
  });

  app.get('/', (req, res) => {
    res.send(200);
  });

  app.get('/storage/:folder/:filename', (request, response) => FileController.getFile.call(FileController, request, response));

  // app.post('/chat-api/hook/workdone', (request, response) => TaskController.workdone.call(TaskController, request, response, enforcer));

  app.post('/chat-api/hook/workdone', (request, response) => ClockInController.clockedIn.call(ClockInController, request, response, enforcer));
  app.get('/qrcode/:nonce', (request, response) => ClockInController.qrCode.call(ClockInController, request, response, enforcer));

  app.post('/gantt-chart/load', (request, response) => GanttController.ganttChartLoad.call(GanttController, request, response, enforcer));
  app.post('/gantt-chart/load2', (request, response) => GanttController.ganttChartLoad2.call(GanttController, request, response, enforcer));
  app.post('/gantt-chart/sync', (request, response) => GanttController.ganttChartSync.call(GanttController, request, response, enforcer));
  app.post('/gantt-chart/sync2', (request, response) => GanttController.ganttChartSync2.call(GanttController, request, response, enforcer));

  app.post('/gantt-chart/share/load', (request, response) => GanttController.ganttChartShareLoad.call(GanttController, request, response, enforcer));

  app.post('/gantt-chart/exportPDF', (request, response) => GanttController.exportPDF.call(GanttController, request, response, enforcer));
  app.get('/gantt-chart/exportPDF/:fileKey', (request, response) => GanttController.getPDF.call(GanttController, request, response, enforcer));

  //init gantt chart when project created
  app.post('/gantt-chart/init', (request, response) => GanttController.ganttChartInit.call(GanttController, request, response, enforcer));

  //init multiple gantt chart
  app.post('/gantt-chart/multiInit', (request, response) => GanttController.ganttChartMultiInit.call(GanttController, request, response, enforcer));

  //init multiple tasks
  app.get('/gantt-chart/insertTasks', (request, response) => GanttController.ganttChartInsertTasks.call(GanttController, request, response, enforcer));
  app.post('/gantt-chart/insertTasks', (request, response) => GanttController.ganttChartInsertTasksPost.call(GanttController, request, response, enforcer));

  app.post('/userNotificationMessage/batchSend', (request, response) => UserNotificationMessageController.userNotificationMessageBatchSend.call(UserNotificationMessageController, request, response, enforcer));

  const server = http.createServer(app);
  apolloServer.installSubscriptionHandlers(server);

  server.listen(PORT, () => {
    logger.info(`Server started at http://localhost:${PORT}${apolloServer.graphqlPath}`);
    logger.info(`Subscriptions started at ws://localhost:${PORT}${apolloServer.subscriptionsPath}`);
  });

  console.log("Server has started!");

  if (boolean(START_CRON) && (process.env.NODE_APP_INSTANCE === undefined || process.env.NODE_APP_INSTANCE === '0')) {
    let crons = Container.get(Crons);
    crons.start(enforcer).then(() => {
      logger.info('Crons created');
    }).catch(error => {
      logger.error(error);
    });
  }
}

main();
