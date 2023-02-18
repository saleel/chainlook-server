import { v4 as uuid } from 'uuid';
import { IWidgetRepository } from '../common/interfaces';
import User from '../domain/user';
import Widget from '../domain/widget';

type UseCaseContext = {
  widgetRepository: IWidgetRepository;
  user: User;
};

export default async function newWidgetUseCase(
  params: Widget,
  context: UseCaseContext,
) {
  const {
    definition, id, title, tags,
  } = params;

  const now = new Date();

  const widget = new Widget({
    id: id || uuid(),
    title,
    user: context.user,
    tags,
    definition,
    version: 1,
    createdOn: now,
    updatedOn: now,
  });

  await context.widgetRepository.createWidget(widget);

  return widget;
}
