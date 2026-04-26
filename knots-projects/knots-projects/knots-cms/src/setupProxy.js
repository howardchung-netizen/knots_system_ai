const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/prod-api',
    createProxyMiddleware({
      target: 'https://new-pms.knotsltd.com',
      changeOrigin: true,
      pathRewrite: { '^/prod-api': '' },
      secure: false
    })
  );
  app.use(
    '/todo-graphql',
    createProxyMiddleware({
      target: 'http://localhost:8004',
      changeOrigin: true,
      pathRewrite: { '^/todo-graphql': '/graphql' },
      ws: true,
      secure: false
    })
  );
  app.use(
    '/todo-api',
    createProxyMiddleware({
      target: 'http://localhost:8004',
      changeOrigin: true,
      pathRewrite: { '^/todo-api': '' },
      secure: false
    })
  );
};
