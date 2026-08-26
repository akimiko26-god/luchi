import { Module } from '@nestjs/common';
import { SocialApplicationService } from './application/services/social-application.service';
import { SocialController } from './presentation/controllers/social.controller';

@Module({
  controllers: [SocialController],
  providers: [SocialApplicationService],
  exports: [SocialApplicationService],
})
export class SocialModule {}
