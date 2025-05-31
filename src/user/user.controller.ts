import { Body, Controller, Get, HttpCode, Param, Patch } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { UserRole } from '@prisma/__generated/*'

import { Authorization } from '@/auth/decorators/auth.decorator'
import { Authorized } from '@/auth/decorators/authorized.decorator'

import { UpdateUserDto } from './dto/update-user.dto'
import { UserService } from './user.service'

@ApiTags('Users')
@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Authorization()
	@HttpCode(200)
	@Get('profile')
	public async findProfile(@Authorized('id') id: string) {
		return this.userService.findById(id)
	}

	@Authorization(UserRole.ADMIN)
	@HttpCode(200)
	@Get('by-id/:id')
	public async findById(@Param('id') id: string) {
		return this.userService.findById(id)
	}

	@Authorization()
	@HttpCode(200)
	@Patch('profile')
	public async updateProfile(
		@Authorized('id') userId: string,
		@Body() dto: UpdateUserDto
	) {
		return this.userService.update(userId, dto)
	}
}
