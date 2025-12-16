export default ({ env }) => ({
  'webtools': {
    enabled: true,
    config: {
      website_url: env('WEBSITE_URL', 'http://localhost:3000'),
    }
  },
});
