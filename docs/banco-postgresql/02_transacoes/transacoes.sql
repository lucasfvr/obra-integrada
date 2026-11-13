\set ON_ERROR_STOP on
-- Teste isolado, sem alterar tabelas do sistema.
BEGIN;
CREATE TEMP TABLE obra_transacao (id integer PRIMARY KEY, descricao text);
INSERT INTO obra_transacao VALUES (1, 'inicial');
SAVEPOINT teste_falha;
INSERT INTO obra_transacao VALUES (2, 'sera revertido');
ROLLBACK TO SAVEPOINT teste_falha;
SELECT COUNT(*) AS esperado_1_apos_rollback FROM obra_transacao;
COMMIT;
-- Persistencia demonstrada com tabela temporaria na mesma sessao:
SELECT COUNT(*) AS esperado_1_apos_commit FROM obra_transacao;
BEGIN;
INSERT INTO obra_transacao VALUES (3, 'rollback integral');
ROLLBACK;
SELECT COUNT(*) AS esperado_1_apos_rollback_integral FROM obra_transacao;
