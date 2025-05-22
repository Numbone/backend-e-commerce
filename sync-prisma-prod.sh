#!/bin/bash

echo "🔄 Starting Prisma DB sync..."

mkdir -p prisma/migrations/0001-init

npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > prisma/migrations/0001-init/migration.sql

echo "📦 Migration SQL file created: $(ls prisma/migrations/0001-init/)"

echo "📤 Applying migration..."
npx prisma db execute --file prisma/migrations/0001-init/migration.sql --schema=prisma/schema.prisma

echo "✅ Migration applied!"
