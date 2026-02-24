import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import * as argon2 from 'argon2';
import { OAuth2Client } from 'google-auth-library';
import { User } from '@prisma/client';

const googleClient = new OAuth2Client();

const LEVEL_MAP: Record<string, string> = {
  'absolute beginner': 'A1',
  beginner: 'A1',
  elementary: 'A2',
  intermediate: 'B1',
  'upper intermediate': 'B2',
  advanced: 'C1',
  a1: 'A1', a2: 'A2', b1: 'B1', b2: 'B2', c1: 'C1', c2: 'C2',
};

const GOAL_MAP: Record<string, string> = {
  travel: 'travel',
  'daily conversation': 'conversation',
  conversation: 'conversation',
  business: 'business',
  'exam preparation': 'exam',
  exam: 'exam',
  'culture & media': 'culture',
  culture: 'culture',
  'heritage learner': 'heritage',
  heritage: 'heritage',
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await argon2.hash(dto.password);

    const user = await this.prisma.user.create({
      data: { email: dto.email, name: dto.name, passwordHash },
    });

    // Bootstrap empty stats row for new user
    await this.prisma.userStats.create({ data: { userId: user.id } });

    return { user: this.sanitize(user), accessToken: this.sign(user) };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.passwordHash) throw new UnauthorizedException('Please sign in with Google');

    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return { user: this.sanitize(updated), accessToken: this.sign(user) };
  }

  private sign(user: User): string {
    return this.jwtService.sign({ sub: user.id, email: user.email });
  }

  async updateMe(userId: string, dto: UpdateMeDto) {
    const data: {
      level?: string;
      goals?: string[];
      dailyGoal?: number;
    } = {};

    if (dto.level !== undefined) {
      data.level = LEVEL_MAP[dto.level.toLowerCase()] ?? dto.level.toUpperCase();
    }

    if (dto.goals !== undefined) {
      data.goals = dto.goals.map(
        (g) => GOAL_MAP[g.toLowerCase()] ?? g.toLowerCase(),
      );
    }

    if (dto.dailyGoal !== undefined) {
      data.dailyGoal = dto.dailyGoal;
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
    });
    return this.sanitize(updated);
  }

  async loginWithGoogle(idToken: string) {
    // Verify the ID token with Google; accept any audience (client ID not
    // required on backend when frontend sends the credential directly).
    const ticket = await googleClient.verifyIdToken({ idToken }).catch(() => {
      throw new UnauthorizedException('Invalid Google token');
    });

    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email) {
      throw new UnauthorizedException('Invalid Google token payload');
    }

    const { sub: googleId, email, name = 'User', picture: avatarUrl } = payload;

    // Find by googleId first, fall back to email (links existing e-mail accounts)
    let user = await this.prisma.user.findFirst({
      where: { OR: [{ googleId }, { email }] },
    });

    if (user) {
      // Update Google fields if not yet linked
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: user.googleId ?? googleId,
          avatarUrl: user.avatarUrl ?? avatarUrl,
          lastLoginAt: new Date(),
        },
      });
    } else {
      // Create a new account (no password needed for OAuth users)
      user = await this.prisma.user.create({
        data: { email, name, googleId, avatarUrl: avatarUrl ?? null },
      });
      await this.prisma.userStats.create({ data: { userId: user.id } });
    }

    return { user: this.sanitize(user), accessToken: this.sign(user) };
  }

  sanitize(user: User) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...rest } = user;
    return rest;
  }
}
