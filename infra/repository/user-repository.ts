import { Knex } from 'knex';
import { IUserRepository } from '../../common/interfaces';
import User from '../../domain/user';

export default class UserRepository implements IUserRepository {
  private db: Knex;

  constructor(db: Knex) {
    this.db = db;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mapDbRowToUser(row: any) {
    return new User({
      id: row.id,
      address: row.address,
      username: row.username,
      createdOn: row.created_on,
      updatedOn: row.updated_on,
    });
  }

  async getUserByAddress(address: string) {
    const row = await this.db('users').where({ address });

    if (row.length !== 1) {
      return null;
    }

    return this.mapDbRowToUser(row[0]);
  }

  async createUser(user: User) {
    await this.db('users').insert({
      id: user.id,
      address: user.address,
      username: user.username,
      created_on: user.createdOn,
      updated_on: user.updatedOn,
    });
  }

  async editUser(user: User) {
    // All fields cannot be updated
    await this.db('users')
      .update({
        username: user.username,
        updated_on: new Date(),
      })
      .where({ id: user.id });
  }
}
