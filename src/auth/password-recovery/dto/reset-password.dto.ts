import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty } from 'class-validator'

export class ResetPasswordDto {
	@ApiProperty({ example: 'example@example.com' })
	@IsEmail({}, { message: 'Введите корректный адрес электронной почты.' })
	@IsNotEmpty({ message: 'Поле email не может быть пустым.' })
	email: string
}
