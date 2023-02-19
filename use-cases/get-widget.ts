import { IWidgetRepository } from '../common/interfaces';

type UseCaseContext = {
  widgetRepository: IWidgetRepository;
};

export default async function getWidgetUseCase(id: string, context: UseCaseContext) {
  const widget = await context.widgetRepository.getWidgetById(id);
  return widget;
}
