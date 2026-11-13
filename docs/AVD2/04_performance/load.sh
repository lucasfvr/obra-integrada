#!/usr/bin/env bash
set -euo pipefail
: "${LAB_DATABASE_URL:?Defina LAB_DATABASE_URL para PostgreSQL local DESCARTAVEL}"
: "${CONFIRM_LAB_LOAD:?Defina CONFIRM_LAB_LOAD=YES}"
[[ "$CONFIRM_LAB_LOAD" == "YES" ]] || exit 2
# Carga moderada e limitada: 4 clientes por 30 segundos.
pgbench -n -S -c 4 -j 2 -T 30 "$LAB_DATABASE_URL"
