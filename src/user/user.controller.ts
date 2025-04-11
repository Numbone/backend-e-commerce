import { Controller, Get, HttpCode, Logger } from '@nestjs/common';
import { UserService } from './user.service';
import { Authorization } from '@/auth/decorators/auth.decorator';
import { Authorized } from '@/auth/decorators/authorized.decorator';

@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  constructor(private readonly userService: UserService) {}
  
  @Authorization()
  @HttpCode(200)
  @Get('profile')
  public async findProfile(@Authorized('id') id: string) {
    this.logger.log(`User ID received: ${id}`); 
    return this.userService.findById(id);
  }
}
