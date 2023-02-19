import Dashboard from '../domain/dashboard';
import User from '../domain/user';
import Widget from '../domain/widget';

export type IPFSService = {
  // Publish and pin JSON
  publishJSON(name: string, content: object): Promise<string>;
};

export interface IDashboardRepository {
  dashboardExists(userId: string, slug: string): Promise<boolean>;
  getDashboardById(id: string): Promise<Dashboard>;
  getDashboardBySlug(slug: string, username?: string): Promise<Dashboard>;
  findDashboards(
    filters: { userId?: string, starredBy?: string, userUsername?: string; search?: string; },
    limit?: number,
    sortKey?: Partial<keyof Dashboard>,
    sortOrder?: 'asc' | 'desc'
  ): Promise<Dashboard[]>;
  createDashboard(dashboard: Dashboard): Promise<void>;
  editDashboard(dashboard: Dashboard): Promise<void>;
  starDashboard(dashboard: Dashboard, user: User): Promise<void>;
  unstarDashboard(dashboard: Dashboard, user: User): Promise<void>;
}

export interface IWidgetRepository {
  getWidgetById(id: string): Promise<Widget>;
  findWidgets(
    filters: { userId?: string, userUsername?: string; search?: string; },
    limit?: number,
    sortKey?: Partial<keyof Widget>,
    sortOrder?: 'asc' | 'desc'
  ): Promise<Widget[]>;
  createWidget(widget: Widget): Promise<void>;
  editWidget(widget: Widget): Promise<void>;
}

export interface IUserRepository {
  getUserByAddress(address: string): Promise<User | null>;
  createUser(user: User): Promise<void>;
  editUser(user: User): Promise<void>;
}
