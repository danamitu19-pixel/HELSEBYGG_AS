// Two completely separate mysql2 connection pools - one per schema.
// Route files import only the pool they are allowed to touch.
// The reports pool is on a DB user that has no privileges on the
// auth schema, so even if code tried to cross the boundary, MySQL
// would reject the query.

const mysql = require('mysql2/promise');

const authPool = mysql.createPool({
  host:            process.env.AUTH_DB_HOST,
  port:            Number(process.env.AUTH_DB_PORT) || 3306,
  user:            process.env.AUTH_DB_USER,
  password:        process.env.AUTH_DB_PASSWORD,
  database:        process.env.AUTH_DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
  charset:         'utf8mb4',
});

const reportsPool = mysql.createPool({
  host:            process.env.REPORTS_DB_HOST,
  port:            Number(process.env.REPORTS_DB_PORT) || 3306,
  user:            process.env.REPORTS_DB_USER,
  password:        process.env.REPORTS_DB_PASSWORD,
  database:        process.env.REPORTS_DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
  charset:         'utf8mb4',
});

async function pingPools() {
  const [a] = await authPool.query('SELECT 1 AS ok');
  const [r] = await reportsPool.query('SELECT 1 AS ok');
  return a[0].ok === 1 && r[0].ok === 1;
}

module.exports = { authPool, reportsPool, pingPools };
