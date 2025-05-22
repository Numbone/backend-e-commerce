#!/bin/bash

set -e

echo "📁 Создаём директорию миграции..."
mkdir -p prisma/migrations/0001-init

echo "📄 Генерируем SQL с diff..."
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > prisma/migrations/0001-init/migration.sql

echo "🧩 Создаём пустой lock-файл..."
echo '{}' > prisma/migrations/0001-init/migration_lock.toml

echo "✅ Отмечаем миграцию как уже применённую..."
npx prisma migrate resolve --applied 0001-init

echo "🎉 Готово! Prisma и база теперь в синхроне."
