import { IWidgetRepository } from '../common/interfaces';
import Widget from '../domain/widget';

type UseCaseContext = {
  widgetRepository: IWidgetRepository;
};

export default async function editWidgetUseCase(
  id: string,
  params: Partial<Widget>,
  context: UseCaseContext,
) {
  const { definition, title, tags } = params;

  const widget = await context.widgetRepository.getWidgetById(id as string);

  let isUpdated = false;

  if (definition) {
    widget.definition = definition;
    isUpdated = true;
  }
  if (title) {
    widget.title = title;
    isUpdated = true;
  }
  if (tags) {
    widget.tags = tags;
    isUpdated = true;
  }

  if (isUpdated) {
    widget.updatedAt = new Date();
    widget.version += 1;
    await context.widgetRepository.editWidget(widget);
  }

  return widget;
}
