import { Type } from 'class-transformer';
import { IsEmail, IsString, ValidateNested } from 'class-validator';
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
  @ValidateNested()
  @Type(() => LoginUserPayloadDto)
  user!: LoginUserPayloadDto;
}
