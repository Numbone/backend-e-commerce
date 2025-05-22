import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { RedisStore } from 'connect-redis'
import * as cookieParser from 'cookie-parser'
import * as session from 'express-session'
import IORedis from 'ioredis'

import { AppModule } from './app.module'
import { ms, StringValue } from './libs/common/utils/ms.utils'
import { parseBoolean } from './libs/common/utils/parse-boolean.util'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	const configSwagger = new DocumentBuilder()
		.setTitle('fullstack')
		.setDescription('The fullstack API description')
		.setVersion('1.0')
		.addTag('full')
		.addCookieAuth('connect.sid')
		.build();

	const documentFactory = () => SwaggerModule.createDocument(app, configSwagger);
	SwaggerModule.setup('api', app, documentFactory);

	const config = app.get(ConfigService)

	const redis = new IORedis(config.getOrThrow('REDIS_URL'))

	const redisStore = new RedisStore({
		client: redis,
		prefix: config.getOrThrow<string>('REDIS_PREFIX')
	})

	app.use(cookieParser(config.getOrThrow<string>('COOKIES_SECRET')))

	app.useGlobalPipes(new ValidationPipe({ transform: true }))

	app.use(
		session({
			secret: config.getOrThrow<string>('SESSION_SECRET'),
			name: config.getOrThrow<string>('SESSION_NAME'),
			resave: false,
			saveUninitialized: false,
			cookie: {
				domain: config.getOrThrow<string>('SESSION_DOMAIN'),
				maxAge: ms(config.getOrThrow<StringValue>('SESSION_MAX_AGE')),
				secure: parseBoolean(
					config.getOrThrow<string>('SESSION_SECURE')
				),
				httpOnly: parseBoolean(
					config.getOrThrow<string>('SESSION_HTTP_ONLY')
				),
				sameSite: 'lax'
			},
			store: redisStore
		})
	)

	app.enableCors({
		origin: config.getOrThrow<string>('ALLOWED_ORIGINS'),
		credentials: true
		//exposedHeaders: ['set-cookie'],
	})

	await app.listen(config.getOrThrow<number>('APPLICATION_PORT'))
}
bootstrap()
