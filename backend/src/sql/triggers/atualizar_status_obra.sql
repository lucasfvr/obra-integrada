CREATE OR REPLACE FUNCTION atualizar_status_obra_apenas()
RETURNS TRIGGER AS $$
BEGIN
  -- Verifica se todas as etapas da obra estão concluídas
  -- Assumindo que id_status = 3 significa "CONCLUÍDO" e id_status = 4 significa "FINALIZADO"
  IF (SELECT COUNT(*) FROM tb_etapa
      WHERE id_obra = NEW.id_obra AND id_status != 3) = 0 THEN
    UPDATE tb_obra
    SET id_status = 4,  -- 4 = FINALIZADO
        data_termino_real = NOW()
    WHERE id_obra = NEW.id_obra;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_status_obra
AFTER UPDATE ON tb_etapa
FOR EACH ROW
EXECUTE FUNCTION atualizar_status_obra_apenas();