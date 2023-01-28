import Dashboard from '../domain/dashboard';
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
  widgetExists(cid?: string, slug?: string): Promise<boolean>;
  getWidgetById(id: string): Promise<Widget>;
  getWidgetBySlug(slug: string): Promise<Widget>;
  findWidgets(
    filters: { authorId: string },
    sortColumn: string
  ): Promise<Widget[]>;
  createWidget(widget: Widget): Promise<void>;
  editWidget(widget: Widget): Promise<void>;
}
