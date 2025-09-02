module.exports = {
  apps: [{
    name: 'og-merchandise',
    script: './backend/server-production.js',
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