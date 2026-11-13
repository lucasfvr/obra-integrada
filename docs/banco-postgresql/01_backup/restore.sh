#!/usr/bin/env bash
set -euo pipefail
: "${RESTORE_DATABASE_URL:?Defina RESTORE_DATABASE_URL da base descartavel}"
: "${BACKUP_FILE:?Defina BACKUP_FILE}"
: "${CONFIRM_LAB_RESTORE:?Defina CONFIRM_LAB_RESTORE=YES para restaurar apenas no homologacao}"
[[ "$CONFIRM_LAB_RESTORE" == "YES" ]] || { echo "Confirmacao invalida"; exit 2; }
[[ -f "$BACKUP_FILE" ]] || { echo "Arquivo nao encontrado"; exit 2; }
if [[ -f "$BACKUP_FILE.sha256" ]]; then (cd "$(dirname "$BACKUP_FILE")" && sha256sum -c "$(basename "$BACKUP_FILE").sha256"); fi
pg_restore --list "$BACKUP_FILE" >/dev/null
echo "ATENCAO: destino deve ser banco VAZIO, DESCARTAVEL e sem dados de producao."
pg_restore --dbname="$RESTORE_DATABASE_URL" --no-owner --no-acl --exit-on-error "$BACKUP_FILE"
echo "Restauracao concluida. Verifique contagens e integridade manualmente."
