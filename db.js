const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'TCC',
    password: 'srikar1',
    port: 5432,
});

module.exports = pool;
