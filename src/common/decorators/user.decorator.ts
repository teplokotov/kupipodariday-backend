import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';

export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();

    // temporary
    request.user = {
      id: 16,
      createdAt: '2024-03-19T14:25:32.103Z',
      updatedAt: '2024-03-19T14:25:32.103Z',
      username: 'Philipp',
      about: 'Описание',
      avatar: 'https://i.pravatar.cc/300',
      email: '123@mail.ru',
    };

    return request.user;
  },
);
