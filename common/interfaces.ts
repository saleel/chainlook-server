import Dashboard from '../domain/dashboard';
import User from '../domain/user';
import Widget from '../domain/widget';

export type IPFSService = {
  // Publish and pin JSON
  publishJSON(name: string, content: object): Promise<string>;
};

export interface IDashboardRepository {
  dashboardExists(cid?: string, slug?: string): Promise<boolean>;
  getDashboardById(id: string): Promise<Dashboard>;
  getDashboardBySlug(slug: string): Promise<Dashboard>;
  findDashboards(
    filters: { authorId: string },
    sortColumn: string
  ): Promise<Dashboard[]>;
  createDashboard(dashboard: Dashboard): Promise<void>;
  editDashboard(dashboard: Dashboard): Promise<void>;
}

export interface IWidgetRepository {
  getWidgetById(id: string): Promise<Widget>;
  findWidgets(
    filters: { authorId: string },
    sortColumn: string
  ): Promise<Widget[]>;
  createWidget(widget: Widget): Promise<void>;
  editWidget(widget: Widget): Promise<void>;
}

export interface IUserRepository {
  getUserByAddress(address: string): Promise<User | null>;
  createUser(user: User): Promise<void>;
  editUser(user: User): Promise<void>;
}
