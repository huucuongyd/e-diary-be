import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AuthService, toPemPublicKey } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              const values: Record<string, string> = {
                KEYCLOAK_URL: 'http://localhost:8080',
                KEYCLOAK_REALM: 'master',
                KEYCLOAK_CLIENT_ID: 'e-diary-backend',
              };
              return values[key];
            },
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('wraps a raw key with PEM begin/end headers', () => {
    expect(toPemPublicKey('abc')).toBe(
      '-----BEGIN PUBLIC KEY-----\nabc\n-----END PUBLIC KEY-----',
    );
  });
});
