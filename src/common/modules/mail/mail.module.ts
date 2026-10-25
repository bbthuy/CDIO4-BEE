import { join } from 'path';
import * as AWS from 'aws-sdk';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfigModule } from 'src/configs/config.module';
import { ConfigService } from 'src/configs/config.service';

@Global()
@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      useFactory: async (config: ConfigService) => {
        return {
          transport: {
            host: config.get('SMTP_HOST'),
            port: config.get('SMTP_PORT'),
            secure: false, // true for 465, false for other ports
            auth: {
              user: config.get('SMTP_USER'),
              pass: config.get('SMTP_PASSWORD')
            }
          },
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true
            }
          }
        };
      },
      inject: [ConfigService]
    })
  ],
  providers: [MailService],
  exports: [MailService]
})
export class MailModule {}
