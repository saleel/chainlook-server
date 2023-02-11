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
      createdAt: row.created_at,
      updatedAt: row.updated_at,
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
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    });
  }

  async editUser(user: User) {
    // All fields cannot be updated
    await this.db('users')
      .update({
        username: user.username,
        updated_at: new Date(),
      })
      .where({ id: user.id });
  }
}
