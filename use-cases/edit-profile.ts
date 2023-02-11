import { IUserRepository } from '../common/interfaces';
import User from '../domain/user';

type UseCaseContext = {
  userRepository: IUserRepository;
};

export default async function editProfileUseCase(
  address: string,
  params: Partial<User>,
  context: UseCaseContext,
) {
  const { username } = params;

  const user = await context.userRepository.getUserByAddress(address);

  if (!user) {
    throw new Error(`No user fond with address ${address}`);
  }

  if (username && user?.username !== username) {
    user.username = username;
    await context.userRepository.editUser(user);
  }

  return user;
}
