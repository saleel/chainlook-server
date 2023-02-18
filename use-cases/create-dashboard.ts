import { v4 as uuid } from 'uuid';
import { IDashboardRepository } from '../common/interfaces';
import { cleanString } from '../common/utils';
import Dashboard from '../domain/dashboard';
import User from '../domain/user';

type UseCaseContext = {
  // ipfsService: IPFSService;
  dashboardRepository: IDashboardRepository;
  user: User;
};

export default async function createDashboardUseCase(
  dashboardInput: Dashboard,
  context: UseCaseContext,
) {
  const { slug } = dashboardInput;

  // const contentName = `ChainLook Dashboard: ${definition.title}`;
  // const cid = await context.ipfsService.publishJSON(contentName, definition);

  if (await context.dashboardRepository.dashboardExists(context.user.id, slug)) {
    throw new Error('Dashboard with same slug already exists');
  }

  const now = new Date();

  const dashboard = new Dashboard({
    ...dashboardInput,
    title: dashboardInput.title.trim(),
    tags: dashboardInput.tags.map((t) => cleanString(t).trim()).filter((t) => t.length > 0),
    id: uuid(),
    user: context.user,
    starCount: 0,
    version: 1,
    createdOn: now,
    updatedOn: now,
  });

  await context.dashboardRepository.createDashboard(dashboard);

  return dashboard;
}
