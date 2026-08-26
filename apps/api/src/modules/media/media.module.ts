import { Module } from '@nestjs/common';
import { MediaApplicationService } from './application/services/media-application.service';
import { MediaController } from './presentation/controllers/media.controller';

@Module({
  controllers: [MediaController],
  providers: [MediaApplicationService],
})
export class MediaModule {}
