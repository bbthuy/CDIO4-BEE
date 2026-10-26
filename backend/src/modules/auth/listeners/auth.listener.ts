import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { LoginEvent } from 'src/common/modules/events/events/auth.event';
import { AuthService } from 'src/modules/auth/auth.service';

@Injectable()
export class AuthListener {
  private readonly logger = new Logger(AuthListener.name);

  constructor(private readonly authService: AuthService) {}

  @OnEvent('auth.login.logged', { async: true })
  handleLoginEvent(payload: LoginEvent) {
    this.logger.log('Handling login event');
    this.authService.create(payload);
  }
}
