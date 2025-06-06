import {
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthMethod, User } from '@prisma/__generated/*'
import { hash, verify } from 'argon2'
import { Request, Response } from 'express'

import { isDev } from '@/libs/common/utils/is-dev.utils'
import { parseBoolean } from '@/libs/common/utils/parse-boolean.util'
import { MailService } from '@/libs/mail/mail.service'
import { PrismaService } from '@/prisma/prisma.service'
import { UserService } from '@/user/user.service'

import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { EmailConfirmationService } from './email-confirmation/email-confirmation.service'
import { ProviderService } from './provider/provider.service'
import { TwoFactorAuthService } from './two-factor-auth/two-factor-auth.service'

@Injectable()
export class AuthService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly userService: UserService,
		private readonly configService: ConfigService,
		private readonly providerService: ProviderService,
		private readonly emailConfirmationService: EmailConfirmationService,
		private readonly twoFactorAuthService: TwoFactorAuthService
	) {}
	public async register(dto: RegisterDto) {
		const isExists = await this.userService.findByEmail(dto.email)
		if (isExists) {
			throw new NotFoundException('User already exists')
		}

		const newUser = await this.userService.create(
			dto.email,
			dto.password,
			dto.name,
			'',
			AuthMethod.CREDENTIALS,
			false
		)

		// await this.emailConfirmationService.sendVerificationToken(newUser.email)

		return {
			message:
				'User successfully created. Email has been sent to your email address.'
		}
	}

	public async login(req: Request, dto: LoginDto) {
		const user = await this.userService.findByEmail(dto.email)
		if (!user || !user.password) {
			throw new NotFoundException('User not found or password not found')
		}
		const isValidPassword = await verify(user.password, dto.password)

		if (!isValidPassword) {
			throw new NotFoundException('Password is not valid')
		}
		if (parseBoolean(this.configService.getOrThrow('MAIL_ACTIVE'))) {
			if (!user.isVerified) {
				await this.emailConfirmationService.sendVerificationToken(
					user.email
				)
				throw new UnauthorizedException('Email is not verified')
			}

			if (user.isTwoFactorEnabled) {
				if (!dto.code) {
					await this.twoFactorAuthService.sendTwoFactorToken(
						user.email
					)

					return {
						message:
							'Проверьте вашу почту. Требуется код двухфакторной аутентификации.'
					}
				}

				await this.twoFactorAuthService.validateTwoFactorToken(
					user.email,
					dto.code
				)
			}
		}

		return this.saveSession(req, user)
	}

	public async extractProfileFromCode(
		req: Request,
		provider: string,
		code: string
	) {
		const providerInstance = this.providerService.findByService(provider)
		const profile = await providerInstance!.findUserByCode(code)
		const account = await this.prismaService.account.findFirst({
			where: {
				provider: profile?.provider,
				id: profile?.id
			}
		})

		let user = account?.userId
			? await this.userService.findById(account.userId)
			: null
		if (user) {
			return this.saveSession(req, user)
		}
		user = await this.userService.create(
			profile.email,
			'',
			profile.name,
			profile.picture,
			AuthMethod[profile.provider.toUpperCase()],
			true
		)
		if (
			!account &&
			profile &&
			profile.access_token &&
			profile.refresh_token &&
			profile.expires_at
		) {
			await this.prismaService.account.create({
				data: {
					type: 'oauth',
					provider: profile.provider,
					userId: user.id,
					accessToken: profile.access_token,
					refreshToken: profile.refresh_token,
					expiresAt: profile.expires_at
				}
			})
		}

		return this.saveSession(req, user)
	}

	public async logout(req: Request, res: Response): Promise<void> {
		return new Promise((resolve, reject) => {
			req.session.destroy(err => {
				if (err) {
					reject(
						new InternalServerErrorException(
							'Internal server error,session could not be destroyed, please try again later'
						)
					)
				}
				res.clearCookie(
					this.configService.getOrThrow<string>('SESSION_NAME')
				)
				resolve()
			})
		})
	}

	public async saveSession(req: Request, user: User) {
		return new Promise((resolve, reject) => {
			req.session.userId = user.id
			req.session.save(err => {
				if (err) {
					reject(
						new InternalServerErrorException(
							'Internal server error,session could not be saved, please try again later'
						)
					)
				} else {
					resolve(user)
				}
			})
		})
	}
}
