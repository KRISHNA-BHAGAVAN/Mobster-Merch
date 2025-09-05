module.exports = {
  apps: [{
    name: 'og-backend',
    script: './backend/server.js',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    instances: 1,
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G'
  }]
};

