#!/usr/bin/env bash
set -euo pipefail
: "${LAB_DATABASE_URL:?Defina LAB_DATABASE_URL para PostgreSQL local DESCARTAVEL}"
: "${CONFIRM_LAB_LOAD:?Defina CONFIRM_LAB_LOAD=YES}"
[[ "$CONFIRM_LAB_LOAD" == "YES" ]] || exit 2
tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT
printf 'SELECT count(*) FROM avd2_perf.carga WHERE id BETWEEN 1 AND 1000;\n' > "$tmp"
# Carga moderada e limitada: 4 clientes por 30 segundos; executar apos lab.sql
pgbench -n -f "$tmp" -c 4 -j 2 -T 30 "$LAB_DATABASE_URL"
