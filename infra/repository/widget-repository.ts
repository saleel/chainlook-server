import { Knex } from 'knex';
import { IWidgetRepository } from '../../common/interfaces';
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
      slug: row.slug,
      cid: row.cid,
      title: row.title,
      authorId: row.author_id,
      authorName: row.author_name,
      tags: row.tags,
      definition: row.definition,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  async getWidgetById(id: string) {
    const row = await this.db('widgets').where({ id });

    if (row.length !== 1) {
      throw new Error(`Cannot get widget with id ${id}`);
    }

    return this.mapDbRowToWidget(row);
  }

  async getWidgetBySlug(slug: string) {
    const row = await this.db('widgets').where({
      slug,
    });

    if (row.length !== 1) {
      throw new Error(`Cannot get widget with slug ${slug}`);
    }

    return this.mapDbRowToWidget(row);
  }

  async widgetExists(cid?: string, slug?: string) {
    const [row] = await this.db('widgets').count('id').where({
      ...cid && { cid },
      ...slug && { slug },
    }).as('count');

    return Number(row.count) > 0;
  }

  async findWidgets(filters: { authorId: string }, sortColumn = 'created_at') {
    const { authorId } = filters;

    const rows = await this.db('widgets').where({
      ...(authorId && { author_id: authorId }),
    }).orderBy(sortColumn);

    return rows.map(this.mapDbRowToWidget);
  }

  async createWidget(widget: Widget) {
    await this.db('widgets').insert({
      id: widget.id,
      cid: widget.cid,
      title: widget.title,
      tags: widget.tags,
      author_id: widget.authorId,
      author_name: widget.authorName,
      definition: JSON.stringify(widget.definition),
      created_at: widget.createdAt,
      updated_at: widget.updatedAt,
    });
  }

  async editWidget(widget: Widget) {
    // All fields cannot be updated
    await this.db('widgets')
      .update({
        cid: widget.cid,
        title: widget.title,
        tags: widget.tags,
        definition: JSON.stringify(widget.definition),
        updated_at: new Date(),
      })
      .where({ id: widget.id });
  }
}
