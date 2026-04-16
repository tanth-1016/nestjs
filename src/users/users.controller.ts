// Created by tran.huu.tan
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UsersAuthService } from './users-auth.service';
import { LoginDto, RegisterDto, UpdateCurrentUserDto } from './dto';
import type { UserResponse } from './types/user-response.types';

type AuthenticatedUser = {
  id: string;
  email: string;
  createdAt?: Date;
};

type RequestWithUser = Request & { user: AuthenticatedUser };

@ApiTags('users')
@Controller()
export class UsersController {
  constructor(private readonly usersAuthService: UsersAuthService) {}

  @Post('users')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiCreatedResponse({
    description: 'Registration successful',
    schema: {
      example: {
        user: {
          email: 'jake@jake.jake',
          token: 'jwt.token.here',
          username: 'Jacob',
          bio: null,
          image: null,
        },
      },
    },
  })
  @ApiConflictResponse({ description: 'Email or username already used' })
  register(@Body() dto: RegisterDto): Promise<UserResponse> {
    return this.usersAuthService.register(dto);
  }

  @Post('users/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiOkResponse({
    description: 'Login successful',
    schema: {
      example: {
        user: {
          email: 'jake@jake.jake',
          token: 'jwt.token.here',
          username: 'Jacob',
          bio: null,
          image: null,
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  login(@Body() dto: LoginDto): Promise<UserResponse> {
    return this.usersAuthService.login(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('user')
  @ApiSecurity('tokenAuth')
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiOkResponse({
    description: 'Current user',
    schema: {
      example: {
        user: {
          email: 'jake@jake.jake',
          token: 'jwt.token.here',
          username: 'Jacob',
          bio: null,
          image: null,
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid Authorization token',
  })
  getCurrentUser(@Req() req: RequestWithUser): Promise<UserResponse> {
    return this.usersAuthService.getCurrentUser(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('user')
  @ApiSecurity('tokenAuth')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiOkResponse({
    description: 'Updated current user',
    schema: {
      example: {
        user: {
          email: 'jake@jake.jake',
          token: 'jwt.token.here',
          username: 'Jacob',
          bio: 'I like to skateboard',
          image: 'https://i.stack.imgur.com/xHWG8.jpg',
        },
      },
    },
  })
  @ApiConflictResponse({ description: 'Email or username already used' })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid Authorization token',
  })
  updateCurrentUser(
    @Req() req: RequestWithUser,
    @Body() dto: UpdateCurrentUserDto,
  ): Promise<UserResponse> {
    return this.usersAuthService.updateCurrentUser(req.user.id, dto);
  }
}
