import { IWidgetRepository } from '../common/interfaces';
import Widget from '../domain/widget';

type UseCaseContext = {
  widgetRepository: IWidgetRepository;
};

type Params = {
  userId: string;
  limit?: number;
  sort?: Partial<keyof Widget>;
  sortOrder?: 'asc' | 'desc';
  userUsername?: string;
  search?: string;
};

export default async function findWidgetsUseCase(
  params: Params,
  context: UseCaseContext,
) {
  const dashboards = await context.widgetRepository.findWidgets(
    {
      userId: params.userId,
      userUsername: params.userUsername,
      search: params.search,
    },
    params.limit || 10,
    params.sort || 'createdOn',
    params.sortOrder || 'desc',
  );

  return dashboards;
}
