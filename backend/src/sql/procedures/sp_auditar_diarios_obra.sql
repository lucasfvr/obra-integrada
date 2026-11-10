-- Mantem a assinatura existente. Parametro p_autorizados fica sempre zero
-- por compatibilidade com chamadas antigas; nao aprova automaticamente.
CREATE OR REPLACE PROCEDURE sp_auditar_diarios_obra(
  IN p_id_obra INTEGER,
  IN p_id_auditor INTEGER,
  IN p_raio_metros INTEGER DEFAULT 150,
  INOUT p_autorizados INTEGER DEFAULT NULL,
  INOUT p_mantidos INTEGER DEFAULT NULL
)
LANGUAGE plpgsql AS $$
DECLARE
  v_lat DECIMAL(10,7);
  v_lon DECIMAL(10,7);
BEGIN
  p_autorizados := 0;
  p_mantidos := 0;

  IF p_raio_metros <= 0 THEN RAISE EXCEPTION 'Raio invalido'; END IF;
  SELECT latitude, longitude INTO v_lat, v_lon FROM tb_obra WHERE id_obra = p_id_obra;
  IF NOT FOUND THEN RAISE EXCEPTION 'Obra % nao encontrada', p_id_obra; END IF;

  IF v_lat IS NULL OR v_lon IS NULL THEN
    RAISE EXCEPTION 'Obra % sem coordenadas', p_id_obra;
  END IF;

  UPDATE tb_diario_obra d
  SET justificativa_gps = FORMAT(
    'Distancia calculada: %s m (referencia %s m). Analise humana obrigatoria.',
    fn_distancia_metros(d.latitude,d.longitude,v_lat,v_lon),
    p_raio_metros)
  WHERE d.id_obra = p_id_obra
    AND d.status_auditoria = 'PENDENTE'
    AND d.latitude IS NOT NULL AND d.longitude IS NOT NULL;
  GET DIAGNOSTICS p_mantidos = ROW_COUNT;

  INSERT INTO tb_log_auditoria(id_usuario, acao, target_id, detalhes)
  VALUES(p_id_auditor, 'AUDITORIA_GPS_INFORMATIVA', p_id_obra,
         FORMAT('%s registros pendentes anotados, 0 aprovados automaticamente.',p_mantidos));
END;
$$;
