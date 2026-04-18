import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import moment from 'moment-timezone';
import { LOG_LEVEL } from './config';

export const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: winston.format.combine(
    winston.format((info: any) => {
      if (info.message instanceof Error) {
        info.message = Object.assign({
          message: info.message.message,
          stack: info.message.stack
        }, info.message);
      }

      if (info instanceof Error) {
        return Object.assign({
          message: info.message,
          stack: info.stack
        }, info);
      }

      try {
        info.message = JSON.parse(info.message);
      } catch (e: any) {}

      return info;
    })(),
    winston.format.label({ label: 'pos-backend' }),
    winston.format(info => {
      return Object.assign({ timestamp: null, label: null, level: null, message: null }, info, { timestamp: moment().utcOffset('+08:00').format('YYYY-MM-DDTHH:mm:ss.SSSZZ') });
    })(),
    winston.format.json()
  ),
  transports: [
    new (DailyRotateFile)({
      filename: 'log/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxFiles: '14d',
    }),
    new (DailyRotateFile)({
      filename: 'log/error-%DATE%.log',
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxFiles: '14d',
    }),
  ],
  exitOnError: false,
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.prettyPrint()
    )
  }));
}

export const loggerStream = {
  write: (message: string) => {
    logger.info(message);
  },
};
