import { Knex } from 'knex';
import { IDashboardRepository } from '../../common/interfaces';
import Dashboard from '../../domain/dashboard';
import User from '../../domain/user';

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
      user: new User({
        id: row.user_id,
        username: row.username,
        address: row.address,
      }),
      tags: row.tags,
      definition: row.definition,
      starred: row.starred,
      version: row.version,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  async getDashboardById(id: string) {
    const row = await this.db('dashboards')
      .select('dashboards.*', 'users.username', 'users.address')
      .join('users', 'dashboards.user_id', '=', 'users.id')
      .where({ 'dashboards.id': id });

    if (row.length !== 1) {
      throw new Error(`Cannot get dashboard with id ${id}`);
    }

    return this.mapDbRowToDashboard(row[0]);
  }

  async getDashboardBySlug(slug: string, username?: string) {
    const row = await this.db('dashboards')
      .select('dashboards.*', 'users.username', 'users.address')
      .join('users', 'dashboards.user_id', '=', 'users.id')
      .where({
        'dashboards.slug': slug,
        ...(username && { username }),
      });

    if (row.length !== 1) {
      throw new Error(`Cannot get dashboard with slug ${slug}`);
    }

    return this.mapDbRowToDashboard(row[0]);
  }

  async dashboardExists(userId: string, slug: string) {
    const [row] = await this.db('dashboards')
      .count('id')
      .where({
        ...(userId && { user_id: userId }),
        ...(slug && { slug }),
      })
      .as('count');

    return Number(row.count) > 0;
  }

  async findDashboards(filters: { userId: string }, sortColumn = 'created_at') {
    const { userId } = filters;

    const rows = await this.db('dashboards')
      .select('dashboards.*', 'users.username', 'users.address')
      .join('users', 'dashboards.user_id', '=', 'users.id')
      .where({
        ...(userId && { user_id: userId }),
      })
      .orderBy(sortColumn);

    return rows.map(this.mapDbRowToDashboard);
  }

  async createDashboard(dashboard: Dashboard) {
    await this.db('dashboards').insert({
      id: dashboard.id,
      cid: dashboard.cid,
      title: dashboard.title,
      slug: dashboard.slug,
      tags: dashboard.tags,
      user_id: dashboard.user.id,
      version: dashboard.version,
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
        slug: dashboard.slug,
        tags: dashboard.tags,
        starred: dashboard.starred,
        version: dashboard.version,
        definition: JSON.stringify(dashboard.definition),
        updated_at: new Date(),
      })
      .where({ id: dashboard.id });
  }
}
