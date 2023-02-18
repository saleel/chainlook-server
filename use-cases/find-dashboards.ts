import { IDashboardRepository } from '../common/interfaces';
import Dashboard from '../domain/dashboard';

type Params = {
  userId: string;
  limit?: number;
  sort?: Partial<keyof Dashboard>;
  sortOrder?: 'asc' | 'desc';
  starredBy?: string;
};

type UseCaseContext = {
  dashboardRepository: IDashboardRepository;
};

export default async function findDashboardsUseCase(
  params: Params,
  context: UseCaseContext,
) {
  const dashboards = await context.dashboardRepository.findDashboards(
    { userId: params.userId, starredBy: params.starredBy },
    params.limit,
    params.sort || 'createdOn',
    params.sortOrder || 'desc',
  );

  return dashboards;
}
