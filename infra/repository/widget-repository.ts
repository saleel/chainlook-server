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
      createdOn: row.created_on,
      updatedOn: row.updated_on,
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

  async findWidgets(
    filters: { userId: string; userUsername?: string; search?: string },
    limit: number,
    sortKey?: Partial<keyof Widget>,
    sortOrder?: 'asc' | 'desc',
  ) {
    const { userId, userUsername, search } = filters;

    let sortColumn = 'created_on';
    if (sortKey === 'createdOn') sortColumn = 'created_on';

    const rows = await this.db('widgets')
      .select('widgets.*', 'users.username', 'users.address')
      .join('users', 'widgets.user_id', '=', 'users.id')
      .where({
        ...(userId && { user_id: userId }),
        ...(userUsername && { 'users.username': userUsername }),
      })
      .orderBy(sortColumn, sortOrder || 'desc')
      .modify((qb) => {
        if (search) {
          // Replace space with slash
          const searchTerms = search.replace(/ /g, ' | ');
          qb.andWhereRaw(
            // eslint-disable-next-line quotes
            `to_tsvector(array_to_string(tags, ' ', ' ') || ' ' || title) @@ to_tsquery('english', ?)`,
            [searchTerms],
          );
        }

        if (limit) {
          qb.limit(limit);
        }
      });

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
      created_on: widget.createdOn,
      updated_on: widget.updatedOn,
    });
  }

  async editWidget(widget: Widget) {
    // All fields cannot be updated
    await this.db('widgets')
      .update({
        title: widget.title,
        tags: widget.tags,
        definition: JSON.stringify(widget.definition),
        updated_on: new Date(),
        version: widget.version,
      })
      .where({ id: widget.id });
  }
}
