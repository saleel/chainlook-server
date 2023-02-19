import { IUserRepository } from '../common/interfaces';
import User from '../domain/user';

type UseCaseContext = {
  userRepository: IUserRepository;
  user: User;
};

export default async function editProfileUseCase(params: Partial<User>, context: UseCaseContext) {
  const { address } = context.user;
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
