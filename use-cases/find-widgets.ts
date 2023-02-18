import { IWidgetRepository } from '../common/interfaces';
import Widget from '../domain/widget';

type UseCaseContext = {
  widgetRepository: IWidgetRepository;
};

export default async function findWidgetsUseCase(
  params: { userId: string, limit?: number, sort?: Partial<keyof Widget>, sortOrder?: 'asc' | 'desc' },
  context: UseCaseContext,
) {
  const dashboards = await context.widgetRepository.findWidgets(
    { userId: params.userId },
    params.limit || 10,
    params.sort || 'createdOn',
    params.sortOrder || 'desc',
  );

  return dashboards;
}
