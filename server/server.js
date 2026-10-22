const app = require('./app');
const { testConnection } = require('./config/database');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Test MySQL DB connection
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.warn('[Server Warning] Could not establish initial database connection. Check MySQL credentials.');
  }

  const server = app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`✈️  SkyBook Flight Reservation API Server`);
    console.log(`🚀  Running at: http://localhost:${PORT}`);
    console.log(`🩺  Health check: http://localhost:${PORT}/api/health`);
    console.log(`=================================================`);
  });

  // Handle process termination gracefully
  const shutdown = () => {
    console.log('[Server] Gracefully shutting down SkyBook API...');
    server.close(() => {
      console.log('[Server] HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

startServer();
