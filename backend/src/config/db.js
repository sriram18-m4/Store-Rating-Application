const { Pool } = require('pg');
require('./env');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL client error', error);
});

const query = (text, params) => pool.query(text, params);

module.exports = {
  pool,
  query
};
