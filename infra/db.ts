import Knex from 'knex';

const db = Knex({
  client: 'pg',
  connection: process.env.DB_URL,
});

export default db;
