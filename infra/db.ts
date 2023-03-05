import Knex from 'knex';

const db = Knex({
  client: 'pg',
  connection: process.env.DATABASE_URL,
});

export default db;
