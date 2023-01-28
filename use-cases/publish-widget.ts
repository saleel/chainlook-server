import { v4 as uuid } from 'uuid';
import { IPFSService, IWidgetRepository } from '../common/interfaces';
import { WidgetDefinition } from '../common/types';
import Widget from '../domain/widget';

type UseCaseContext = {
  ipfsService: IPFSService
  widgetRepository: IWidgetRepository
}

type PublishWidgetInput = {
  slug: string,
  definition: WidgetDefinition;
}

export default async function publishWidgetUseCase(publishDashboardInput: PublishWidgetInput, context: UseCaseContext) {
  const { definition, slug } = publishDashboardInput;

  if (!slug.startsWith(`${definition.author.name}/`)) {
    throw new Error("Slug should prefixed with author name '[authorName]/[slug]'");
  }

  const contentName = `ChainLook Dashboard: ${definition.title}`;
  const cid = await context.ipfsService.publishJSON(contentName, definition);

  if (await context.widgetRepository.widgetExists(cid)) {
    throw new Error('Widget with same definition already exists');
  }

  const now = new Date();

  const widget = new Widget({
    id: uuid(),
    slug,
    cid,
    title: definition.title,
    authorId: definition.author.id,
    authorName: definition.author.name,
    tags: definition.tags,
    definition,
    createdAt: now,
    updatedAt: now,
  });

  await context.widgetRepository.createWidget(widget);

  return widget;
}
