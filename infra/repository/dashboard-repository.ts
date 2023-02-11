import { Knex } from 'knex';
import { IDashboardRepository } from '../../common/interfaces';
import Dashboard from '../../domain/dashboard';

export default class DashboardRepository implements IDashboardRepository {
  private db: Knex;

  constructor(db: Knex) {
    this.db = db;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mapDbRowToDashboard(row: any) {
    return new Dashboard({
      id: row.id,
      slug: row.slug,
      cid: row.cid,
      title: row.title,
      authorId: row.author_id,
      authorName: row.author_name,
      tags: row.tags,
      definition: row.definition,
      starred: row.starred,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  async getDashboardById(id: string) {
    const row = await this.db('dashboards').where({ id });

    if (row.length !== 1) {
      throw new Error(`Cannot get dashboard with id ${id}`);
    }

    return this.mapDbRowToDashboard(row);
  }

  async getDashboardBySlug(slug: string) {
    const row = await this.db('dashboards').where({
      slug,
    });

    if (row.length !== 1) {
      throw new Error(`Cannot get dashboard with slug ${slug}`);
    }

    return this.mapDbRowToDashboard(row);
  }

  async dashboardExists(cid?: string, slug?: string) {
    const [row] = await this.db('dashboards')
      .count('id')
      .where({
        ...(cid && { cid }),
        ...(slug && { slug }),
      })
      .as('count');

    return Number(row.count) > 0;
  }

  async findDashboards(
    filters: { authorId: string },
    sortColumn = 'created_at',
  ) {
    const { authorId } = filters;

    const rows = await this.db('dashboards')
      .where({
        ...(authorId && { author_id: authorId }),
      })
      .orderBy(sortColumn);

    return rows.map(this.mapDbRowToDashboard);
  }

  async createDashboard(dashboard: Dashboard) {
    await this.db('dashboards').insert({
      id: dashboard.id,
      cid: dashboard.cid,
      title: dashboard.title,
      tags: dashboard.tags,
      author_id: dashboard.authorId,
      author_name: dashboard.authorName,
      definition: JSON.stringify(dashboard.definition),
      created_at: dashboard.createdAt,
      updated_at: dashboard.updatedAt,
    });
  }

  async editDashboard(dashboard: Dashboard) {
    // All fields cannot be updated
    await this.db('dashboards')
      .update({
        cid: dashboard.cid,
        title: dashboard.title,
        tags: dashboard.tags,
        starred: dashboard.starred,
        definition: JSON.stringify(dashboard.definition),
        updated_at: new Date(),
      })
      .where({ id: dashboard.id });
  }
}
