export type WidgetDefinition = {
  title: string;
  type: string;
  data: object;
  author: {
    id: string;
    name: string;
  };
  tags: string[];
};

export type DashboardDefinition = {
  title: string;
  widgets: {
    widget: WidgetDefinition;
    layout: { x: number; y: number; w: number; h: number };
  }[];
  author: {
    id: string;
    name: string;
  };
  tags: string[];
};
