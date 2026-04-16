import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class RegisterUserPayloadDto {
  @ApiProperty({
    example: 'Jacob',
    description: 'Unique username',
  })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({
    example: 'jake@jake.jake',
    description: 'User email address',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'jakejake',
    minLength: 6,
    description: 'User password',
  })
  @IsString()
  @MinLength(6)
  password!: string;
}

export class RegisterDto {
  @ApiProperty({
    description: 'Registration payload',
    type: RegisterUserPayloadDto,
  })
  @ValidateNested()
  @Type(() => RegisterUserPayloadDto)
  user!: RegisterUserPayloadDto;
}
