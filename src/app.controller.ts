import { Controller, Get } from '@nestjs/common';
import {
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('hello')
@Controller('hello')
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get('hello-world')
  @ApiOperation({
    summary: 'Get localized hello world message',
    description:
      'Returns a hello world message based on the requested language.',
  })
  @ApiHeader({
    name: 'x-lang',
    description: 'Language code (e.g., en, vi)',
    required: false,
  })
  @ApiOkResponse({
    description: 'Successful response with localized hello world message',
    content: {
      'text/plain': {
        schema: {
          type: 'string',
          example: 'Hello World',
        },
      },
    },
  })
  async getHello(): Promise<string> {
    return this.appService.getHello();
  }
}
