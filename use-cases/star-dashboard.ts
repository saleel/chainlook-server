import { IDashboardRepository } from '../common/interfaces';
import User from '../domain/user';

export default async function starDashboardUseCase(
  params: { isStarred: boolean; dashboardId: string },
  context: { dashboardRepository: IDashboardRepository; user: User },
) {
  const { isStarred, dashboardId } = params;
  const { dashboardRepository } = context;

  const dashboard = await dashboardRepository.getDashboardById(dashboardId);

  if (!dashboard) {
    throw new Error('Dashboard not found');
  }

  if (isStarred === true) {
    dashboard.starCount += 1;
    await dashboardRepository.starDashboard(dashboard, context.user);
  }

  if (isStarred === false) {
    dashboard.starCount -= 1;
    await dashboardRepository.unstarDashboard(dashboard, context.user);
  }

  return { starCount: dashboard.starCount };
}
