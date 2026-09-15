-- ============================================================================
-- STORED PROCEDURE: sp_auditar_diarios_obra
-- ----------------------------------------------------------------------------
-- Audita em lote a fila de diarios pendentes de UMA obra, usando a distancia
-- ate a obra como critério, e deixa registro de quem mandou auditar.
--
-- POR QUE PROCEDURE E NAO FUNCTION:
-- uma function em Postgres existe para devolver valor e e chamada dentro de um
-- SELECT. Esta rotina nao devolve valor: ela ESCREVE em duas tabelas
-- (tb_diario_obra e tb_log_auditoria) e informa quantas linhas mexeu por
-- parametros INOUT. E o caso de uso de PROCEDURE -- invocada com CALL, nao com
-- SELECT.
--
-- PARA QUE SERVE NA PRATICA:
-- os registros criados antes do trigger trg_classificar_diario_gps existir
-- ficaram todos como 'PENDENTE', sem ninguem ter olhado. Esta procedure limpa
-- essa fila de uma vez: o que esta comprovadamente dentro do canteiro passa a
-- 'AUTORIZADO', o que esta fora continua 'PENDENTE' -- mas agora com a
-- distancia escrita na justificativa, para o engenheiro decidir sabendo.
--
-- Uso:
--   CALL sp_auditar_diarios_obra(1, 7, 150, NULL, NULL);
-- ============================================================================

CREATE OR REPLACE PROCEDURE sp_auditar_diarios_obra(
  IN    p_id_obra       INTEGER,
  IN    p_id_auditor    INTEGER,
  IN    p_raio_metros   INTEGER DEFAULT 150,
  INOUT p_autorizados   INTEGER DEFAULT NULL,
  INOUT p_mantidos      INTEGER DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_obra_nome  TEXT;
  v_obra_lat   DECIMAL(10,7);
  v_obra_lon   DECIMAL(10,7);
BEGIN
  p_autorizados := 0;
  p_mantidos    := 0;

  SELECT o.nome, o.latitude, o.longitude
    INTO v_obra_nome, v_obra_lat, v_obra_lon
    FROM tb_obra o
   WHERE o.id_obra = p_id_obra;

  IF v_obra_nome IS NULL THEN
    RAISE EXCEPTION 'Obra % nao existe.', p_id_obra;
  END IF;

  IF v_obra_lat IS NULL OR v_obra_lon IS NULL THEN
    RAISE EXCEPTION 'Obra % (%) nao tem coordenada cadastrada: nao da para auditar por GPS.',
      p_id_obra, v_obra_nome;
  END IF;

  -- 1. Dentro do perimetro -> autoriza.
  UPDATE tb_diario_obra d
     SET status_auditoria  = 'AUTORIZADO',
         justificativa_gps = FORMAT('Auditoria em lote: %s m da obra (limite %s m).',
                                    fn_distancia_metros(d.latitude, d.longitude, v_obra_lat, v_obra_lon),
                                    p_raio_metros)
   WHERE d.id_obra          = p_id_obra
     AND d.status_auditoria  = 'PENDENTE'
     AND d.latitude  IS NOT NULL
     AND d.longitude IS NOT NULL
     AND fn_distancia_metros(d.latitude, d.longitude, v_obra_lat, v_obra_lon) <= p_raio_metros;

  GET DIAGNOSTICS p_autorizados = ROW_COUNT;

  -- 2. Fora do perimetro -> continua pendente, mas com a distancia anotada.
  --    Auditoria automatica nao reprova ninguem: quem reprova e pessoa.
  UPDATE tb_diario_obra d
     SET justificativa_gps = FORMAT('Fora do perimetro: %s m da obra (limite %s m). Exige decisao do responsavel.',
                                    fn_distancia_metros(d.latitude, d.longitude, v_obra_lat, v_obra_lon),
                                    p_raio_metros)
   WHERE d.id_obra          = p_id_obra
     AND d.status_auditoria  = 'PENDENTE'
     AND d.latitude  IS NOT NULL
     AND d.longitude IS NOT NULL
     AND fn_distancia_metros(d.latitude, d.longitude, v_obra_lat, v_obra_lon) > p_raio_metros;

  GET DIAGNOSTICS p_mantidos = ROW_COUNT;

  -- 3. Rastro: quem mandou auditar, em que obra, com que resultado.
  INSERT INTO tb_log_auditoria (id_usuario, acao, target_id, detalhes)
  VALUES (
    p_id_auditor,
    'AUDITORIA_LOTE_DIARIO',
    p_id_obra,
    FORMAT('Obra "%s": %s autorizados, %s mantidos pendentes (raio %s m).',
           v_obra_nome, p_autorizados, p_mantidos, p_raio_metros)
  );
END;
$$;
