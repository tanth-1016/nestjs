import { Controller, Get } from '@nestjs/common';
import { I18n, I18nContext } from 'nestjs-i18n';

@Controller('hello')
export class AppController {
  @Get('hello-world')
  getHello(@I18n() i18n: I18nContext): string {
    return i18n.t('common.HELLO');
  }
}
