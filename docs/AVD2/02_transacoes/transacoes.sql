\set ON_ERROR_STOP on
-- Teste isolado, sem alterar tabelas do sistema.
BEGIN;
CREATE TEMP TABLE avd2_transacao (id integer PRIMARY KEY, descricao text);
INSERT INTO avd2_transacao VALUES (1, 'inicial');
SAVEPOINT teste_falha;
INSERT INTO avd2_transacao VALUES (2, 'sera revertido');
ROLLBACK TO SAVEPOINT teste_falha;
SELECT COUNT(*) AS esperado_1_apos_rollback FROM avd2_transacao;
COMMIT;
-- Persistencia demonstrada com tabela temporaria na mesma sessao:
SELECT COUNT(*) AS esperado_1_apos_commit FROM avd2_transacao;
BEGIN;
INSERT INTO avd2_transacao VALUES (3, 'rollback integral');
ROLLBACK;
SELECT COUNT(*) AS esperado_1_apos_rollback_integral FROM avd2_transacao;
