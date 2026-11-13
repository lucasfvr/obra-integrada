\set ON_ERROR_STOP on
-- Testes controlados em tabela temporaria. Nenhuma tabela de negocio alterada.
BEGIN;
CREATE TEMP TABLE obra_transacao(id integer PRIMARY KEY, descricao text) ON COMMIT PRESERVE ROWS;
INSERT INTO obra_transacao VALUES (1,'commit');
SAVEPOINT demonstrar_rollback;
INSERT INTO obra_transacao VALUES (2,'desfazer');
ROLLBACK TO SAVEPOINT demonstrar_rollback;
SELECT count(*) AS esperado_1 FROM obra_transacao;
COMMIT;
SELECT count(*) AS esperado_1_apos_commit FROM obra_transacao;
BEGIN;
INSERT INTO obra_transacao VALUES (3,'rollback_integral');
ROLLBACK;
SELECT count(*) AS esperado_1_apos_rollback FROM obra_transacao;
-- Evidencia adicional feita no Neon: SQLSTATE 23505 em transaction,
-- ID 987654: 0 registros antes e 0 depois (13/11/2026).
