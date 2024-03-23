import { Injectable } from '@nestjs/common';
import { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt';

@Injectable()
export class JwtConfigFactory implements JwtOptionsFactory {
  // https://github.com/nestjs/jwt?tab=readme-ov-file#async-options
  createJwtOptions(): JwtModuleOptions {
    return {
      secret: 'jwt_secret',
      signOptions: {
        expiresIn: 36000,
      },
    };
  }
}
