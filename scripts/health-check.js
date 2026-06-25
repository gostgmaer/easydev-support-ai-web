// Generic container healthcheck for any of the 4 Next.js apps - just confirms
// the standalone server is accepting connections and responding on its root.
const http = require('http');

const req = http.request(
  { host: 'localhost', port: process.env.PORT || 3000, path: '/', timeout: 2000 },
  (res) => {
    process.exit(res.statusCode && res.statusCode < 500 ? 0 : 1);
  },
);
req.on('error', () => process.exit(1));
req.end();
