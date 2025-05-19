FROM node:20.19.2-alpine as base 

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package*.json ./

RUN npm ci

FROM base as build

COPY . .

RUN npm run prisma:generate

RUN npm run build

FROM base as production

ENV NODE_ENV=production

WORKDIR /app

COPY --from=build /app/package*.json ./

RUN npm run i --production

COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma/__generated__ ./prisma/__generated__

CMD ["node", "dist/main"]


