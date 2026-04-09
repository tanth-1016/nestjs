import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
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

type AuthenticatedUser = {
  id: string;
  email: string;
  createdAt?: Date;
};

type RequestWithUser = Request & { user: AuthenticatedUser };

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
  @HttpCode(HttpStatus.OK)
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
  @ApiBearerAuth('bearer')
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
    return {
      id: req.user.id,
      email: req.user.email,
      createdAt: req.user.createdAt,
    };
  }
}
