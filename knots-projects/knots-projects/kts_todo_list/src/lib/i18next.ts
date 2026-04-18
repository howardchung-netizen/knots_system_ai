import i18n from 'i18next';
import middleware, { App } from 'i18next-express-middleware';
import Backend from 'i18next-node-fs-backend';

export const i18next = (app: App) => {
  i18n
    .use(middleware.LanguageDetector)
    .use(Backend)
    .init(
      {
        preload: ['zh-HK', 'zh-CN', 'en'],
        backend: {
          loadPath: `${__dirname}/../../locales/{{lng}}/{{ns}}.json`,
          addPath: `${__dirname}/../../locales/{{lng}}/{{ns}}.json`,
          jsonIndent: 2,
        },
        ns: [],
        lng: 'zh-HK',
      },
      () => {
        middleware.addRoute(
          i18n,
          '/:lng/key-to-translate',
          ['zh-HK', 'zh-CN', 'en'],
          app,
          (req, res) => {
            console.log('i18next fun', req, res);
          },
        );
      },
    );

  app.use(middleware.handle(i18n));
};
