import { Knex } from 'knex';
import { IWidgetRepository } from '../../common/interfaces';
import User from '../../domain/user';
import Widget from '../../domain/widget';

export default class WidgetRepository implements IWidgetRepository {
  private db: Knex;

  constructor(db: Knex) {
    this.db = db;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mapDbRowToWidget(row: any) {
    return new Widget({
      id: row.id,
      title: row.title,
      user: new User({
        id: row.user_id,
        username: row.username,
        address: row.address,
      }),
      tags: row.tags,
      definition: row.definition,
      version: Number(row.version),
      forkId: row.fork_id,
      forkVersion: row.fork_version,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  async getWidgetById(id: string) {
    const row = await this.db('widgets')
      .select('widgets.*', 'users.username', 'users.address')
      .join('users', 'widgets.user_id', '=', 'users.id')
      .where({ 'widgets.id': id });

    if (row.length !== 1) {
      throw new Error(`Cannot get widget with id ${id}`);
    }

    return this.mapDbRowToWidget(row[0]);
  }

  async findWidgets(filters: { userId: string }, sortColumn = 'created_at') {
    const { userId } = filters;

    const rows = await this.db('widgets')
      .select('widgets.*', 'users.username', 'users.address')
      .join('users', 'widgets.user_id', '=', 'users.id')
      .where({
        ...(userId && { user_id: userId }),
      })
      .orderBy(sortColumn);

    return rows.map(this.mapDbRowToWidget);
  }

  async createWidget(widget: Widget) {
    await this.db('widgets').insert({
      id: widget.id,
      title: widget.title,
      definition: JSON.stringify(widget.definition),
      tags: widget.tags,
      user_id: widget.user.id,
      version: widget.version,
      fork_id: widget.forkId,
      fork_version: widget.forkVersion,
      created_at: widget.createdAt,
      updated_at: widget.updatedAt,
    });
  }

  async editWidget(widget: Widget) {
    // All fields cannot be updated
    await this.db('widgets')
      .update({
        title: widget.title,
        tags: widget.tags,
        definition: JSON.stringify(widget.definition),
        updated_at: new Date(),
        version: widget.version,
      })
      .where({ id: widget.id });
  }
}
