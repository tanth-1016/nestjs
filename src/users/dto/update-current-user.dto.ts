import { Type } from 'class-transformer';
import {
  IsDefined,
  IsEmail,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class UpdateCurrentUserPayloadDto {
  @ApiProperty({
    example: 'jake@jake.jake',
    required: false,
    description: 'New email',
  })
  @ValidateIf((_, value) => value !== undefined)
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: 'Jacob',
    required: false,
    description: 'New username',
  })
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  username?: string;

  @ApiProperty({
    example: 'jakejake',
    required: false,
    minLength: 6,
    description: 'New password',
  })
  @ValidateIf((_, value) => value !== undefined)
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
  @IsDefined()
  @IsObject()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => UpdateCurrentUserPayloadDto)
  user!: UpdateCurrentUserPayloadDto;
}
