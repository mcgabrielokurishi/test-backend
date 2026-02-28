import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "database/prisma.service";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { LoginDto } from "./dto/login.dto";
import { RefreshDto } from "./dto/refresh.dto";
import { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
  private MAX_FAILED_ATTEMPTS = 5;
  private LOCK_TIME_MINUTES = 15; 

  constructor( 
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  // REGISTER

  async register(dto: RegisterDto) {
    const { email, phone, password } = dto;

    if (!email && !phone) {
      throw new BadRequestException("Email or Phone required");
    }

    const otpRecord = await this.prisma.oTP.findFirst({
      where: {
        OR: [{ email }, { phone }],
        purpose: "REGISTER",
        verified: true,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      throw new UnauthorizedException("OTP not verified");
    }

    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });

    if (existingUser) {
      throw new BadRequestException("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.$transaction(async (db) => {
      const newUser = await db.user.create({
        data: {
          email,
          phone,
          password: hashedPassword,
        },
      });

      await db.wallet.create({
        data: {
          userId: newUser.id,
          balance: 0,
        },
      });

      return newUser;
    });

    return this.generateTokens(user.id, user.email ?? user.phone!);
  }

  // LOGIN

  async login(dto: LoginDto) {
    const { identifier, password } = dto;

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
      },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (user.lockedUntill && user.lockedUntill > new Date()) {
      throw new ForbiddenException("Account locked. Try later.");
    }

    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      await this.handleFailedLogin(user.id);
      throw new UnauthorizedException("Invalid credentials");
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: 0,
        lockedUntill: null,
      },
    });

    return this.generateTokens(user.id, user.email ?? user.phone!);
  }

  // REFRESH 

  async refresh(dto: RefreshDto) {
    const { refreshToken } = dto;

    try {
      const payload = await this.jwtService.verifyAsync(
        refreshToken.toString(),
        {
          secret: process.env.JWT_REFRESH_SECRET,
        }
      ) as { sub: string; email: string };

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException();
      }

      return this.generateTokens(user.id, user.email ?? user.phone!);
    } catch (error) {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: "15m",
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: "7d",
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  // FAILED 

  private async handleFailedLogin(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const newAttempts = (user?.failedAttempts || 0) + 1;

    let updateData: any = {
      failedAttempts: newAttempts,
    };

    if (newAttempts >= this.MAX_FAILED_ATTEMPTS) {
      updateData.lockedUntil = new Date(
        Date.now() + this.LOCK_TIME_MINUTES * 60 * 1000
      );
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }
}