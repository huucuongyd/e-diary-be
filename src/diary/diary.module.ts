import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { DiaryController } from './diary.controller';
import { DiaryService } from './diary.service';
import { DiaryEntry } from './entities/diary-entry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DiaryEntry]), AuthModule],
  controllers: [DiaryController],
  providers: [DiaryService],
})
export class DiaryModule {}
