import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { GoogleRecaptchaModule } from '@nestlab/google-recaptcha';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getRecaptchaConfig } from '@/config/recaptcha.config';

@Module({
  imports: [
		GoogleRecaptchaModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: getRecaptchaConfig,
			inject: [ConfigService]
		}),
	
	],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
