import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';
@Module({
  imports: [UserModule, PassportModule.register({ defaultStrategy: 'jwt' }), JwtModule.registerAsync({ inject: [ConfigService], useFactory: (config: ConfigService) => ({ secret: config.getOrThrow<string>('JWT_SECRET'), signOptions: { expiresIn: Number(config.get<string>('JWT_EXPIRATION', '3600')) } }) })],
  controllers: [AuthController], providers: [AuthService, JwtStrategy, RolesGuard], exports: [JwtModule, PassportModule],
})
export class AuthModule {}
