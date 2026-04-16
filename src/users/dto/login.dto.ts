import { Type } from 'class-transformer';
import {
  IsDefined,
  IsEmail,
  IsNotEmptyObject,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class LoginUserPayloadDto {
  @ApiProperty({
    example: 'jake@jake.jake',
    description: 'Registered email',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'jakejake',
    description: 'Account password',
  })
  @IsString()
  password!: string;
}

export class LoginDto {
  @ApiProperty({
    description: 'Login payload',
    type: LoginUserPayloadDto,
  })
  @IsDefined()
  @IsObject()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => LoginUserPayloadDto)
  user!: LoginUserPayloadDto;
}
