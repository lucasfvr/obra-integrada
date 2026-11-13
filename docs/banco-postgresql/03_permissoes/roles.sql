\\set ON_ERROR_STOP on
-- Executar somente na branch obra-integrada com privilegios administrativos.
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='obra_leitura') THEN CREATE ROLE obra_leitura NOLOGIN; END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='obra_escrita') THEN CREATE ROLE obra_escrita NOLOGIN; END IF;
END $$;
CREATE SCHEMA IF NOT EXISTS obra_integrada;
REVOKE ALL ON SCHEMA obra_integrada FROM PUBLIC;
GRANT USAGE ON SCHEMA obra_integrada TO obra_leitura, obra_escrita;
GRANT SELECT ON ALL TABLES IN SCHEMA obra_integrada TO obra_leitura;
GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA obra_integrada TO obra_escrita;
ALTER DEFAULT PRIVILEGES IN SCHEMA obra_integrada GRANT SELECT ON TABLES TO obra_leitura;
ALTER DEFAULT PRIVILEGES IN SCHEMA obra_integrada GRANT SELECT,INSERT,UPDATE,DELETE ON TABLES TO obra_escrita;
SELECT has_table_privilege('obra_leitura','obra_integrada.carga','SELECT') AS leitura_select,has_table_privilege('obra_leitura','obra_integrada.carga','INSERT') AS leitura_insert,has_table_privilege('obra_escrita','obra_integrada.carga','INSERT') AS escrita_insert;
