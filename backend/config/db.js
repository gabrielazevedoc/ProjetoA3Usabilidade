const sql = require('mssql');
const dotenv = require('dotenv');

dotenv.config();

const dbConfig = {
  server: process.env.DB_SERVER,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: Number(process.env.DB_PORT || 1433),
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log('✅ Conectado ao SQL Server');
    return pool;
  })
  .catch(err => {
    console.error('❌ Erro ao conectar ao SQL Server', err);
    throw err;
  });

module.exports = {
  sql,
  poolPromise
};
