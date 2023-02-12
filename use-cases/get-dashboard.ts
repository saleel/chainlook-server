import { IDashboardRepository } from '../common/interfaces';

type UseCaseContext = {
  dashboardRepository: IDashboardRepository;
};

export default async function getDashboardUseCase(
  id: string,
  context: UseCaseContext,
) {
  if (id.includes(':')) {
    // Assume author:slug format
    const [username, slug] = id.split(':');
    return context.dashboardRepository.getDashboardBySlug(slug, username);
  }

  return context.dashboardRepository.getDashboardById(id);
}
