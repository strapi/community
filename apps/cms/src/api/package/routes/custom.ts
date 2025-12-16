module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/packages/count',
      handler: 'api::package.package.count',
    },
    {
      method: 'GET',
      path: '/packages/random',
      handler: 'api::package.package.random',
    },
  ],
};
