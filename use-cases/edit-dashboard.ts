import { IDashboardRepository } from '../common/interfaces';
import User from '../domain/user';
import Dashboard from '../domain/dashboard';
import { cleanString } from '../common/utils';

type UseCaseContext = {
  dashboardRepository: IDashboardRepository;
  user: User;
};

export default async function editDashboardUseCase(
  id: string,
  params: Partial<Dashboard>,
  context: UseCaseContext
) {
  const { definition, title, tags } = params;

  const dashboard = await context.dashboardRepository.getDashboardById(
    id as string
  );

  if (!dashboard) {
    throw new Error(`No dashboard found with id ${id}`);
  }

  if (dashboard.user.id !== context.user.id) {
    throw new Error(
      `User ${context.user.id} is not allowed to edit dashboard ${id}`
    );
  }

  let isUpdated = false;

  if (definition) {
    dashboard.definition = definition;
    isUpdated = true;
  }
  if (title) {
    dashboard.title = title.trim();
    isUpdated = true;
  }
  if (tags) {
    dashboard.tags = tags.map((t) => cleanString(t).trim()).filter((t) => t.length > 0);
    isUpdated = true;
  }

  if (isUpdated) {
    dashboard.updatedOn = new Date();
    dashboard.version += 1;
    await context.dashboardRepository.editDashboard(dashboard);
  }

  return dashboard;
}
