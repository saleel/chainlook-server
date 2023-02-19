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
      starCount: row.star_count,
      version: row.version,
      isPrivate: row.is_private,
      createdOn: row.created_on,
      updatedOn: row.updated_on,
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
        user_id: userId,
        slug,
      })
      .as('count');

    return Number(row.count) > 0;
  }

  async findDashboards(
    filters: {
      userId?: string;
      starredBy?: string;
      userUsername?: string;
      search?: string;
    },
    limit: number,
    sortKey?: Partial<keyof Dashboard>,
    sortOrder?: 'asc' | 'desc',
  ) {
    const { userId, userUsername, search } = filters;

    let sortColumn = 'created_on';
    if (sortKey === 'createdOn') sortColumn = 'created_on';
    if (sortKey === 'updatedOn') sortColumn = 'updated_on';
    if (sortKey === 'starCount') sortColumn = 'star_count';

    const rows = await this.db('dashboards')
      .select('dashboards.*', 'users.username', 'users.address')
      .join('users', 'dashboards.user_id', '=', 'users.id')
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
        if (filters.starredBy) {
          qb.join('stars', 'dashboards.id', '=', 'stars.dashboard_id').where({
            'stars.user_id': filters.starredBy,
          });
        }
      });

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
      is_private: dashboard.isPrivate,
      created_on: dashboard.createdOn,
      updated_on: dashboard.updatedOn,
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
        star_count: dashboard.starCount,
        version: dashboard.version,
        definition: JSON.stringify(dashboard.definition),
        is_private: dashboard.isPrivate,
        updated_on: dashboard.updatedOn,
      })
      .where({ id: dashboard.id });
  }

  async starDashboard(dashboard: Dashboard, user: User): Promise<void> {
    await this.db.transaction(async (trx) => {
      await trx('dashboards')
        .update({
          star_count: dashboard.starCount,
        })
        .where({ id: dashboard.id });

      await trx('stars').insert({
        dashboard_id: dashboard.id,
        user_id: user.id,
        created_on: new Date(),
      });
    });
  }

  async unstarDashboard(dashboard: Dashboard, user: User): Promise<void> {
    await this.db.transaction(async (trx) => {
      await trx('dashboards')
        .update({
          star_count: dashboard.starCount,
        })
        .where({ id: dashboard.id });

      await trx('stars')
        .where({
          dashboard_id: dashboard.id,
          user_id: user.id,
        })
        .delete();
    });
  }
}
