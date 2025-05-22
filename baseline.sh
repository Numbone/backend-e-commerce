#!/bin/bash

# Название первой миграции
MIGRATION_NAME="0001-init"

# Шаг 1: Создаём папку под миграцию
mkdir -p prisma/migrations/$MIGRATION_NAME

# Шаг 2: Генерируем SQL из текущей схемы (как будто миграция с нуля)
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > prisma/migrations/$MIGRATION_NAME/migration.sql

# Шаг 3: Отмечаем миграцию как уже применённую
npx prisma migrate resolve --applied $MIGRATION_NAME

echo "✅ Миграция $MIGRATION_NAME создана и помечена как применённая."
