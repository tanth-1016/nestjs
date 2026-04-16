import { Type } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class UpdateCurrentUserPayloadDto {
  @ApiProperty({
    example: 'jake@jake.jake',
    required: false,
    description: 'New email',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: 'Jacob',
    required: false,
    description: 'New username',
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({
    example: 'jakejake',
    required: false,
    minLength: 6,
    description: 'New password',
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiProperty({
    example: 'I like to skateboard',
    required: false,
    nullable: true,
    description: 'User biography',
  })
  @IsOptional()
  @IsString()
  bio?: string | null;

  @ApiProperty({
    example: 'https://i.stack.imgur.com/xHWG8.jpg',
    required: false,
    nullable: true,
    description: 'Profile image URL',
  })
  @IsOptional()
  @IsUrl()
  image?: string | null;
}

export class UpdateCurrentUserDto {
  @ApiProperty({
    description: 'User update payload',
    type: UpdateCurrentUserPayloadDto,
  })
  @ValidateNested()
  @Type(() => UpdateCurrentUserPayloadDto)
  user!: UpdateCurrentUserPayloadDto;
}
