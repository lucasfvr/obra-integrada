-- Diario de Obra: GPS apenas como observacao, nunca como aprovacao.
-- Aplicar no ambiente de homologacao antes de utilizar a API revisada.
CREATE OR REPLACE FUNCTION fn_classificar_diario_gps()
RETURNS TRIGGER AS $$
DECLARE
  v_obra_lat DECIMAL(10,7);
  v_obra_lon DECIMAL(10,7);
  v_distancia DECIMAL(12,2);
BEGIN
  NEW.status_auditoria := 'PENDENTE';
  SELECT o.latitude, o.longitude INTO v_obra_lat, v_obra_lon
    FROM tb_obra o WHERE o.id_obra = NEW.id_obra;

  IF NEW.latitude IS NULL OR NEW.longitude IS NULL THEN
    NEW.justificativa_gps := 'Localizacao nao informada; revisao humana necessaria.';
  ELSIF v_obra_lat IS NULL OR v_obra_lon IS NULL THEN
    NEW.justificativa_gps := 'Obra sem coordenadas cadastradas; revisao humana necessaria.';
  ELSE
    v_distancia := fn_distancia_metros(NEW.latitude, NEW.longitude, v_obra_lat, v_obra_lon);
    NEW.justificativa_gps := FORMAT('Distancia calculada: %s m. Indicador auxiliar, nao comprova presenca.', v_distancia);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_classificar_diario_gps ON tb_diario_obra;
CREATE TRIGGER trg_classificar_diario_gps
BEFORE INSERT ON tb_diario_obra
FOR EACH ROW EXECUTE FUNCTION fn_classificar_diario_gps();
