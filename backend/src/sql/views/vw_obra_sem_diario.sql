-- ============================================================================
-- VIEW GERENCIAL: vw_obra_sem_diario
-- ----------------------------------------------------------------------------
-- Pergunta que responde: "qual obra parou de mandar noticia?"
--
-- O diario de obra so vale se for diario. Uma obra em andamento sem registro
-- ha uma semana e o alerta mais barato e mais util que este banco consegue dar:
-- ou a obra parou, ou a equipe parou de registrar. Nos dois casos o gestor
-- precisa saber, e hoje ninguem descobre isso sem abrir obra por obra.
--
-- Lista apenas obras que deveriam estar produzindo diario (nao concluidas),
-- ordenadas pelo silencio mais longo primeiro.
-- ============================================================================

CREATE OR REPLACE VIEW vw_obra_sem_diario AS
SELECT
  o.id_obra,
  o.nome                                       AS obra,
  o.cidade,
  COALESCE(s.nome, 'sem status')               AS status_obra,
  u.nome                                       AS responsavel,
  ultimo.ultimo_registro,
  COALESCE(
    (CURRENT_DATE - ultimo.ultimo_registro),
    (CURRENT_DATE - o.data_inicio)
  )                                            AS dias_em_silencio,
  ultimo.total_registros,
  CASE
    WHEN ultimo.ultimo_registro IS NULL THEN 'NUNCA REGISTROU'
    WHEN (CURRENT_DATE - ultimo.ultimo_registro) >= 15 THEN 'CRITICO'
    WHEN (CURRENT_DATE - ultimo.ultimo_registro) >= 7  THEN 'ATENCAO'
    ELSE 'EM DIA'
  END                                          AS alerta
FROM tb_obra o
LEFT JOIN tb_status  s ON s.id_status  = o.id_status
LEFT JOIN tb_usuario u ON u.id_usuario = o.id_usuario_responsavel
LEFT JOIN (
  SELECT
    d.id_obra,
    MAX(d.data_registro)::DATE AS ultimo_registro,
    COUNT(*)                   AS total_registros
  FROM tb_diario_obra d
  GROUP BY d.id_obra
) ultimo ON ultimo.id_obra = o.id_obra
-- Obra concluida nao precisa mais de diario: sai do alerta.
WHERE COALESCE(s.nome, '') <> 'Concluída'
  AND (
        ultimo.ultimo_registro IS NULL
     OR (CURRENT_DATE - ultimo.ultimo_registro) >= 7
  );
