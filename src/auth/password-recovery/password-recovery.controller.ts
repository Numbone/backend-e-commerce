import { Controller } from '@nestjs/common';
import { PasswordRecoveryService } from './password-recovery.service';

@Controller('password-recovery')
export class PasswordRecoveryController {
  constructor(private readonly passwordRecoveryService: PasswordRecoveryService) {}
}
