#!/usr/bin/env bash
set -euo pipefail
: "${BACKUP_DATABASE_URL:?Defina BACKUP_DATABASE_URL da base de homologacao}"
: "${BACKUP_DIR:?Defina BACKUP_DIR fora do repositorio}"
umask 077
mkdir -p "$BACKUP_DIR"
stamp="$(date -u +%Y%m%dT%H%M%SZ)"
file="$BACKUP_DIR/obra_integrada_$stamp.dump"
pg_dump --dbname="$BACKUP_DATABASE_URL" --format=custom --no-owner --no-acl --file="$file"
pg_restore --list "$file" >/dev/null
sha256sum "$file" > "$file.sha256"
echo "Backup validado: $file"
# Retencao: configurar no armazenamento de backup, apos aprovacao da politica.
