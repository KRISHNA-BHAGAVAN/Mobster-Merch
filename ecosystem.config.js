module.exports = {
  apps: [{
    name: 'og-merchandise',
    script: './backend/server.js',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      DB_HOST: "localhost",
      DB_PORT: 3306,
      DB_USER: "edith",
      DB_PASSWORD: "Edith@1234",
      DB_NAME: "merchandise",
      JWT_SECRET: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwMDUsIm5hbWUiOiJKb2huIERvZSIsInJvbGUiOjEsImNhbXB1cyI6Ik1haW4gQ2FtcHVzIiwiZGVwdCI6IkNTRSIsImlhdCI6MTc1NTE1OTgyMCwiZXhwIjoxNzU1MTg4NjIwfQ.k6YDFuGU6AAyPRf8IGgz7bqELkTO_oTJvznrwNQao-s"
    },
    instances: 1,
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G'
  }]
};
