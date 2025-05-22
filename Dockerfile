FROM node:20.19.2-alpine as base

RUN apk add --no-cache libc6-compat bash

WORKDIR /app

COPY package*.json ./
RUN npm ci

FROM base as build

COPY . .
RUN npx prisma generate
RUN npm run build

FROM base as production

ENV NODE_ENV=production

WORKDIR /app

COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma/__generated__ ./prisma/__generated__
COPY --from=build /app/prisma/schema.prisma ./prisma/schema.prisma
COPY --from=build /app/sync-prisma-prod.sh ./sync-prisma-prod.sh

# Делаем скрипт исполняемым
RUN chmod +x ./sync-prisma-prod.sh

# Добавляем запуск скрипта перед приложением
CMD ["sh", "-c", "./sync-prisma-prod.sh && node dist/main"]
