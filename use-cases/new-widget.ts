import { v4 as uuid } from 'uuid';
import { IWidgetRepository } from '../common/interfaces';
import { WidgetDefinition } from '../common/types';
import User from '../domain/user';
import Widget from '../domain/widget';

type UseCaseContext = {
  widgetRepository: IWidgetRepository;
  user: User;
};

type NewWidgetInput = {
  definition: WidgetDefinition;
  id: string;
  title: string;
  tags: string[];
};

export default async function newWidgetUseCase(
  params: NewWidgetInput,
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
    createdAt: now,
    updatedAt: now,
  });

  await context.widgetRepository.createWidget(widget);

  return widget;
}
