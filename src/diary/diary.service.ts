import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { S3Service } from '../storage/s3.service';
import { CreateDiaryDto } from './dto/create-diary.dto';
import { UpdateDiaryDto } from './dto/update-diary.dto';
import { DiaryEntry } from './entities/diary-entry.entity';

type UploadedImage = {
  mimetype: string;
  buffer: Buffer;
};

const IMAGE_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

@Injectable()
export class DiaryService {
  constructor(
    @InjectRepository(DiaryEntry)
    private readonly diaryRepo: Repository<DiaryEntry>,
    private readonly s3: S3Service,
  ) {}

  async create(authorId: string, dto: CreateDiaryDto) {
    const entry = this.diaryRepo.create({
      authorId,
      title: this.requireText(dto.title, 'title'),
      content: this.requireText(dto.content, 'content'),
      imageUrl: null,
    });
    return this.diaryRepo.save(entry);
  }

  findAll(authorId: string) {
    return this.diaryRepo.find({
      where: { authorId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(authorId: string, id: string) {
    const entry = await this.diaryRepo.findOne({ where: { id, authorId } });
    if (!entry) {
      throw new NotFoundException('Diary entry not found');
    }
    return entry;
  }

  async update(authorId: string, id: string, dto: UpdateDiaryDto) {
    const entry = await this.findOne(authorId, id);

    if (dto.title !== undefined) {
      entry.title = this.requireText(dto.title, 'title');
    }
    if (dto.content !== undefined) {
      entry.content = this.requireText(dto.content, 'content');
    }

    return this.diaryRepo.save(entry);
  }

  async uploadImage(authorId: string, id: string, image?: UploadedImage) {
    if (!image) {
      throw new BadRequestException('image is required');
    }
    const entry = await this.findOne(authorId, id);
    await this.s3.deleteByUrl(entry.imageUrl);
    entry.imageUrl = await this.saveImage(image);
    return this.diaryRepo.save(entry);
  }

  async removeImage(authorId: string, id: string) {
    const entry = await this.findOne(authorId, id);
    await this.s3.deleteByUrl(entry.imageUrl);
    entry.imageUrl = null;
    return this.diaryRepo.save(entry);
  }

  async remove(authorId: string, id: string) {
    const entry = await this.findOne(authorId, id);
    await this.s3.deleteByUrl(entry.imageUrl);
    await this.diaryRepo.remove(entry);
    return { deleted: true };
  }

  private requireText(value: string | undefined, field: string) {
    const text = value?.trim();
    if (!text) {
      throw new BadRequestException(`${field} is required`);
    }
    return text;
  }

  private async saveImage(image: UploadedImage) {
    const ext = IMAGE_EXT[image.mimetype];
    if (!ext) {
      throw new BadRequestException('Unsupported image type');
    }
    return this.s3.upload(`diary/${randomUUID()}${ext}`, image.buffer, image.mimetype);
  }
}

export function requireAuthorId(sub?: string) {
  if (!sub) {
    throw new UnauthorizedException('Token is missing subject');
  }
  return sub;
}
