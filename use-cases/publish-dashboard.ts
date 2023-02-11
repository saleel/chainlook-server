import { v4 as uuid } from 'uuid';
import { IDashboardRepository, IPFSService } from '../common/interfaces';
import { DashboardDefinition } from '../common/types';
import Dashboard from '../domain/dashboard';

type UseCaseContext = {
  ipfsService: IPFSService;
  dashboardRepository: IDashboardRepository;
};

type PublishDashboardInput = {
  slug: string;
  definition: DashboardDefinition;
};

export default async function publishDashboard(
  publishDashboardInput: PublishDashboardInput,
  context: UseCaseContext,
) {
  const { definition, slug } = publishDashboardInput;

  if (!slug.startsWith(`${definition.author.name}/`)) {
    throw new Error(
      "Slug should prefixed with author name '[authorName]/[slug]'",
    );
  }

  const contentName = `ChainLook Dashboard: ${definition.title}`;
  const cid = await context.ipfsService.publishJSON(contentName, definition);

  if (await context.dashboardRepository.dashboardExists(cid)) {
    throw new Error('Dashboard with same definition already exists');
  }

  const now = new Date();

  const dashboard = new Dashboard({
    id: uuid(),
    slug,
    cid,
    title: definition.title,
    authorId: definition.author.id,
    authorName: definition.author.name,
    tags: definition.tags,
    definition,
    starred: 0,
    createdAt: now,
    updatedAt: now,
  });

  await context.dashboardRepository.createDashboard(dashboard);

  return dashboard;
}
