import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import type { JwtPayload } from 'jsonwebtoken';
import { JwtAuthGuard } from './jwt-auth.guard';

type AuthedRequest = Request & { user?: JwtPayload };

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  me(@Req() req: AuthedRequest) {
    return req.user;
  }
}
