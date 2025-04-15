import { Authorization } from '@/auth/decorators/auth.decorator';
import { Authorized } from '@/auth/decorators/authorized.decorator';
import { Controller, Get, HttpCode, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRole } from '@prisma/__generated/*';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

 
  @Authorization()
  @HttpCode(200)
  @Get('profile')
  public async findProfile(@Authorized('id') id: string) {
    return this.userService.findById(id);
  }

  @Authorization(UserRole.ADMIN)
  @HttpCode(200)
  @Get("by-id/:id")
  public async findById(@Param('id') id: string) {
    return this.userService.findById(id);
  }
}
