import { IWidgetRepository } from '../common/interfaces';

type UseCaseContext = {
  widgetRepository: IWidgetRepository;
};

export default async function findWidgetsUseCase(
  filters: { userId: string },
  context: UseCaseContext,
) {
  const widgets = await context.widgetRepository.findWidgets({ userId: filters.userId });
  return widgets;
}
