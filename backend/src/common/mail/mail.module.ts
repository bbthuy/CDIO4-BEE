import { join } from 'path';
import * as AWS from 'aws-sdk';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfigService } from '@nestjs/config';
import { existsSync } from 'fs';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async (config: ConfigService) => {
        // Thử đường dẫn dist trước
        // let templatesPath = join(__dirname, 'templates');
        let templatesPath = join(process.cwd(), 'src/common/mail/templates');
        // Nếu không tồn tại trong dist, dùng đường dẫn src
        if (!existsSync(templatesPath)) {
          templatesPath = join(process.cwd(), 'src/common/mail/templates');
        }

        console.log('📧 Email Templates Path:', templatesPath);

        return {
          transport: {
            host: config.get('SMTP_HOST'),
            port: config.get('SMTP_PORT'),
            secure: false,
            auth: {
              user: config.get('SMTP_USER'),
              pass: config.get('SMTP_PASSWORD')
            }
          },
          template: {
            dir: templatesPath,
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
