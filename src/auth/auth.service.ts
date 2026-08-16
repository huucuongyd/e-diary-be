import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import * as jwt from 'jsonwebtoken';
import { Payload } from './interfaces/payload.interface';
import { RedisService } from '../redis/redis.service';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly redisService: RedisService,
    private readonly userService: UserService
  ) {}

  async verifyAccessToken(token: string): Promise<Payload> {
    try {
      const payload = jwt.verify(token, this.publicKey, {
        algorithms: ['RS256'],
        issuer: `${this.keycloakUrl}/realms/${this.realm}`,
      });

      if (typeof payload === 'string') {
        throw new UnauthorizedException('Invalid access token');
      }

      const user = await this.redisService.get(`user:${payload.email}`);

      if (!user) {
        const userDb = await this.userService.findOne(payload.email);
        if (!userDb) {
          await this.userService.create({
            email: payload.email,
            username: payload.username,
          });
        }
        await this.redisService.set(`user:${payload.email}`, userDb);
      }

      return {
        sub: payload.sub,
        email: payload.email,
        username: payload.username,
        iat: payload.iat,
        exp: payload.exp,
      } as Payload;
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }
  }

  private get keycloakUrl(): string {
    return (
      this.config.get<string>('KEYCLOAK_URL') ?? 'http://localhost:8080'
    ).replace(/\/$/, '');
  }

  private get realm(): string {
    return this.config.get<string>('KEYCLOAK_REALM') ?? 'ediary';
  }

  private get publicKey(): string {
    const keyPath = join(process.cwd(), 'keyauth');
    if (existsSync(keyPath)) {
      return toPemPublicKey(readFileSync(keyPath, 'utf8'));
    }
    return toPemPublicKey(this.config.get<string>('KEYCLOAK_PUBLIC_KEY') ?? '');
  }
}

export function toPemPublicKey(raw: string): string {
  const normalized = raw.replace(/\\n/g, '\n').trim();
  if (!normalized) {
    throw new UnauthorizedException('Missing Keycloak public key');
  }
  if (normalized.includes('BEGIN PUBLIC KEY')) {
    return normalized;
  }
  return `-----BEGIN PUBLIC KEY-----\n${normalized}\n-----END PUBLIC KEY-----`;
}
