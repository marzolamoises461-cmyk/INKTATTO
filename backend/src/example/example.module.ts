import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ExampleController } from './example.controller';

@Module({
  imports: [AuthModule],
  controllers: [ExampleController],
  providers: [RolesGuard],
})
export class ExampleModule {}
