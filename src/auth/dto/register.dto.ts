import { IsPasswordsMatchingConstraint } from '@/libs/common/decorators/src/libs/common/decorators/is-passwords-matching-constraint.decorator'
import { ApiProperty } from '@nestjs/swagger'
import {
	IsEmail,
	IsNotEmpty,
	IsString,
	MinLength,
	Validate
} from 'class-validator'



/**
 * DTO для регистрации пользователя.
 */
export class RegisterDto {
	/**
	 * Имя пользователя.
	 * @example John Doe
	 */
	@ApiProperty({
			example: '',
			required: true
		 })
	@IsString({ message: "Name must be a string." })
	@IsNotEmpty({ message: 'Name is required.' })
	name: string

	/**
	 * Email пользователя.
	 * @example example@example.com
	 */
	@ApiProperty({
		example: '',
		required: true
	 })
	@IsString({ message: 'Email must be a string.' })
	@IsEmail({}, { message: 'Некорректный формат email.' })
	@IsNotEmpty({ message: 'Email обязателен для заполнения.' })
	email: string

	/**
	 * Пароль пользователя.
	 * @example password123
	 */
	@ApiProperty({
		example: '',
		required: true
	 })
	@IsString({ message: 'Пароль должен быть строкой.' })
	@IsNotEmpty({ message: 'Пароль обязателен для заполнения.' })
	@MinLength(6, {
		message: 'Пароль должен содержать минимум 6 символов.'
	})
	password: string

	/**
	 * Подтверждение пароля пользователя.
	 * @example password123
	 */
	@ApiProperty({
		example: '',
		required: true
	 })
	@IsString({ message: 'Пароль подтверждения должен быть строкой.' })
	@IsNotEmpty({ message: 'Поле подтверждения пароля не может быть пустым.' })
	@MinLength(6, {
		message: 'Пароль подтверждения должен содержать не менее 6 символов.'
	})
	@Validate(IsPasswordsMatchingConstraint, {
		message: 'Пароли не совпадают.'
	})
	passwordRepeat: string
}