#!/bin/sh

echo "🔧 CREATING migration directory"
mkdir -p prisma/migrations/0001-init

echo "🔄 Generating migration SQL..."
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > prisma/migrations/0001-init/migration.sql

echo "📤 Applying migration..."
npx prisma db execute --file prisma/migrations/0001-init/migration.sql --schema=prisma/schema.prisma

echo "✅ Migration applied!"
