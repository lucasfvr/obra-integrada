-- ============================================================================
-- VIEW GERENCIAL: vw_diario_auditoria_obra
-- ----------------------------------------------------------------------------
-- Pergunta que responde: "como esta o diario de cada obra?"
--
-- Uma linha por obra, com o volume de registros, a divisao por status de
-- auditoria e ha quantos dias a obra nao recebe registro nenhum.
-- E a tela que o gestor quer e que hoje nao existe: hoje da para ver o diario
-- de UMA obra por vez, entrando na obra. Nao da para comparar as obras.
-- ============================================================================

CREATE OR REPLACE VIEW vw_diario_auditoria_obra AS
SELECT
  o.id_obra,
  o.nome                                        AS obra,
  o.cidade,
  s.nome                                        AS status_obra,
  COUNT(d.id_diario)                            AS total_registros,
  COUNT(*) FILTER (WHERE d.status_auditoria = 'AUTOMATICO') AS validados_por_gps,
  COUNT(*) FILTER (WHERE d.status_auditoria = 'AUTORIZADO') AS autorizados_por_pessoa,
  COUNT(*) FILTER (WHERE d.status_auditoria = 'PENDENTE')   AS aguardando_auditoria,
  COUNT(*) FILTER (WHERE d.status_auditoria = 'REPROVADO')  AS reprovados,
  -- Atencao: o LEFT JOIN produz uma linha fantasma (todos os d.* nulos) para
  -- obra sem nenhum registro. Sem o "d.id_diario IS NOT NULL" essas duas
  -- contagens acusariam 1 registro sem foto / sem GPS numa obra com 0 registros.
  COUNT(*) FILTER (WHERE d.id_diario IS NOT NULL AND d.foto_url IS NULL) AS sem_foto,
  COUNT(*) FILTER (WHERE d.id_diario IS NOT NULL AND d.latitude IS NULL) AS sem_gps,
  COUNT(DISTINCT d.id_usuario)                  AS pessoas_que_registraram,
  MAX(d.data_registro)::DATE                    AS ultimo_registro,
  (CURRENT_DATE - MAX(d.data_registro)::DATE)   AS dias_sem_registro
FROM tb_obra o
LEFT JOIN tb_status s     ON s.id_status = o.id_status
LEFT JOIN tb_diario_obra d ON d.id_obra  = o.id_obra
GROUP BY o.id_obra, o.nome, o.cidade, s.nome;
