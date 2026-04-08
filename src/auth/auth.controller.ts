import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

type RequestWithUser = Request & { user: { id: string; email: string } };

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({
    description: 'User registered successfully',
    schema: {
      example: {
        user: {
          id: 'd124a7bc-d88f-4326-85a5-50916f6c6495',
          email: 'user@example.com',
          createdAt: '2026-04-07T07:31:37.237Z',
        },
        accessToken: 'jwt-access-token',
      },
    },
  })
  @ApiConflictResponse({ description: 'Email already used' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'Login successful',
    schema: {
      example: {
        accessToken: 'jwt-access-token',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiOkResponse({
    description: 'Authenticated user profile',
    schema: {
      example: {
        id: 'd124a7bc-d88f-4326-85a5-50916f6c6495',
        email: 'user@example.com',
        createdAt: '2026-04-07T07:31:37.237Z',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  me(@Req() req: RequestWithUser) {
    const user = req.user as unknown as {
      id: string;
      email: string;
      createdAt?: Date;
    };

    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
