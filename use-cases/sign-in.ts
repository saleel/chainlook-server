import { SiweMessage } from 'siwe';
import JWT from 'jsonwebtoken';
import { v4 } from 'uuid';
import { IUserRepository } from '../common/interfaces';
import User from '../domain/user';

type SignInInput = {
  signature: string;
  message: string;
};

export default async function signInUseCase(
  params: SignInInput,
  context: { userRepository: IUserRepository },
) {
  const { message, signature } = params;
  const { userRepository } = context;

  const siweMessage = new SiweMessage(message);
  const { address, expirationTime } = await siweMessage.validate(signature);

  let user = await userRepository.getUserByAddress(address);

  if (!user) {
    user = new User({
      id: v4(),
      address,
      createdOn: new Date(),
      updatedOn: new Date(),
    });

    await userRepository.createUser(user);
  }

  const token = JWT.sign(
    { id: user.id, username: user.username, address },
    process.env.JWT_SECRET as string,
    {
      expiresIn: expirationTime
        ? (new Date(expirationTime).getTime() - new Date().getTime()) / 1000
        : '2 days',
    },
  );

  return { token, user };
}
