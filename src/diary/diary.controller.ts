import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiTags,
} from '@nestjs/swagger';
import type { JwtPayload } from 'jsonwebtoken';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { diaryImageUpload } from './diary-upload';
import { DiaryService, requireAuthorId } from './diary.service';
import { CreateDiaryDto } from './dto/create-diary.dto';
import { UpdateDiaryDto } from './dto/update-diary.dto';

@ApiTags('diary')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('diary')
export class DiaryController {
  constructor(private readonly diaryService: DiaryService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateDiaryDto) {
    return this.diaryService.create(requireAuthorId(user.sub), dto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.diaryService.findAll(requireAuthorId(user.sub));
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.diaryService.findOne(requireAuthorId(user.sub), id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDiaryDto,
  ) {
    return this.diaryService.update(requireAuthorId(user.sub), id, dto);
  }

  @Post(':id/image')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['image'],
      properties: {
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image', diaryImageUpload))
  uploadImage(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() image?: { mimetype: string; buffer: Buffer },
  ) {
    return this.diaryService.uploadImage(requireAuthorId(user.sub), id, image);
  }

  @Delete(':id/image')
  removeImage(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.diaryService.removeImage(requireAuthorId(user.sub), id);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.diaryService.remove(requireAuthorId(user.sub), id);
  }
}
