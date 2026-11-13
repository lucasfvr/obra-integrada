#!/usr/bin/env bash
set -euo pipefail
: "${DATABASE_URL:?Defina DATABASE_URL de um banco descartavel, nunca production}"
: "${CONFIRM_TEST_LOAD:?Defina CONFIRM_TEST_LOAD=YES}"
[[ "$CONFIRM_TEST_LOAD" == "YES" ]] || { echo "Confirmacao invalida"; exit 2; }
command -v pgbench >/dev/null || { echo "pgbench nao instalado"; exit 1; }
# Tabela sintetica preparada por lab.sql; nenhum dado de usuario.
tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT
printf 'SELECT count(*) FROM obra_integrada.carga_experimento WHERE id BETWEEN 1 AND 1000;\n' > "$tmp"
echo "Benchmark controlado: 4 clientes, 2 threads, 30 segundos."
pgbench --no-vacuum --file="$tmp" --client=4 --jobs=2 --time=30 "$DATABASE_URL"
