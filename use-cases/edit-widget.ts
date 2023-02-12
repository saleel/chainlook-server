import { IWidgetRepository } from '../common/interfaces';
import User from '../domain/user';
import Widget from '../domain/widget';

type UseCaseContext = {
  widgetRepository: IWidgetRepository;
  user: User;
};

export default async function editWidgetUseCase(
  id: string,
  params: Partial<Widget>,
  context: UseCaseContext,
) {
  const { definition, title, tags } = params;

  const widget = await context.widgetRepository.getWidgetById(id as string);

  if (!widget) {
    throw new Error(`No widget found with id ${id}`);
  }

  if (widget.user.id !== context.user.id) {
    throw new Error(`User ${context.user.id} is not allowed to edit widget ${id}`);
  }

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
