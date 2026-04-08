import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Registered email',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: '12345678',
    description: 'Account password',
  })
  @IsString()
  password!: string;
}
