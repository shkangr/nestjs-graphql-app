import { Module } from '@nestjs/common';
import { DataLoaderService } from './dataloader.service';

@Module({
  providers: [DataLoaderService],
  exports: [DataLoaderService],
})
export class DataLoaderModule {}
