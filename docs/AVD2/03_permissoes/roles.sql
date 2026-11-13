\set ON_ERROR_STOP on
-- APENAS PostgreSQL local de laboratorio; executar com usuario administrador.
-- Senhas/LOGIN devem ser provisionados por canal seguro, fora do SQL versionado.
DO $$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'avd2_leitor') THEN
   CREATE ROLE avd2_leitor NOLOGIN;
 END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'avd2_escritor') THEN
   CREATE ROLE avd2_escritor NOLOGIN;
 END IF;
END $$;
CREATE SCHEMA IF NOT EXISTS avd2_lab;
CREATE TABLE IF NOT EXISTS avd2_lab.registros (id integer PRIMARY KEY, descricao text);
REVOKE ALL ON SCHEMA avd2_lab FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA avd2_lab FROM PUBLIC;
GRANT USAGE ON SCHEMA avd2_lab TO avd2_leitor, avd2_escritor;
GRANT SELECT ON avd2_lab.registros TO avd2_leitor;
GRANT SELECT, INSERT, UPDATE, DELETE ON avd2_lab.registros TO avd2_escritor;
REVOKE INSERT, UPDATE, DELETE ON avd2_lab.registros FROM avd2_leitor;
SELECT rolname, rolcanlogin FROM pg_roles WHERE rolname LIKE 'avd2_%';
SELECT grantee, privilege_type FROM information_schema.role_table_grants WHERE table_schema='avd2_lab';
-- Testar em sessao separada com role autorizada: SET ROLE avd2_leitor;
-- SELECT * FROM avd2_lab.registros; (permitido)
-- INSERT INTO avd2_lab.registros VALUES (1,'teste'); (negado)
-- RESET ROLE;
