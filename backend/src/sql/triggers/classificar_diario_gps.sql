-- ============================================================================
-- TRIGGER: trg_classificar_diario_gps  (BEFORE INSERT em tb_diario_obra)
-- ----------------------------------------------------------------------------
-- Decide o status_auditoria de um registro do diario de obra no momento em que
-- ele nasce, comparando a coordenada do registro com a coordenada da obra.
--
-- POR QUE NO BANCO E NAO NA APLICACAO:
-- o controller (criarEntradaDiario) le status_auditoria direto do corpo da
-- requisicao:
--       status_auditoria: status_auditoria || 'PENDENTE'
-- ou seja, quem registra pode enviar 'AUTORIZADO' e passar por cima da auditoria
-- do engenheiro. No banco essa decisao nao pode ser burlada pelo cliente, venha
-- a requisicao de onde vier (app, celular, Insomnia).
--
-- ESCOPO DELIBERADAMENTE ESTREITO: so BEFORE INSERT. A auditoria feita depois
-- pelo engenheiro (PATCH .../auditar, que faz UPDATE) NAO e tocada por este
-- trigger. Ele governa o nascimento do registro, nunca a decisao humana.
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_classificar_diario_gps()
RETURNS TRIGGER AS $$
DECLARE
  v_raio_m      CONSTANT INTEGER := 150;  -- tolerancia do canteiro, em metros
  v_obra_lat    DECIMAL(10,7);
  v_obra_lon    DECIMAL(10,7);
  v_distancia_m DECIMAL(12,2);
BEGIN
  SELECT o.latitude, o.longitude
    INTO v_obra_lat, v_obra_lon
    FROM tb_obra o
   WHERE o.id_obra = NEW.id_obra;

  -- Caso 1: o registro chegou sem GPS (app antigo, permissao negada no celular).
  IF NEW.latitude IS NULL OR NEW.longitude IS NULL THEN
    NEW.status_auditoria  := 'PENDENTE';
    NEW.justificativa_gps := 'Registro sem coordenada: exige conferencia manual.';
    RETURN NEW;
  END IF;

  -- Caso 2: a obra nao tem coordenada cadastrada. A culpa e do cadastro, nao de
  -- quem registrou -- mas tambem nao da para afirmar que estava no lugar.
  IF v_obra_lat IS NULL OR v_obra_lon IS NULL THEN
    NEW.status_auditoria  := 'PENDENTE';
    NEW.justificativa_gps := 'Obra sem coordenada cadastrada: impossivel validar o local.';
    RETURN NEW;
  END IF;

  v_distancia_m := fn_distancia_metros(NEW.latitude, NEW.longitude, v_obra_lat, v_obra_lon);

  -- Caso 3: dentro do canteiro. Valida automaticamente e diz a distancia, para
  -- o engenheiro poder discordar com numero na mao.
  IF v_distancia_m <= v_raio_m THEN
    NEW.status_auditoria  := 'AUTOMATICO';
    NEW.justificativa_gps := FORMAT('Dentro do perimetro da obra (%s m de %s m).',
                                    v_distancia_m, v_raio_m);
  -- Caso 4: fora do canteiro. Nao reprova -- so para na fila do engenheiro.
  ELSE
    NEW.status_auditoria  := 'PENDENTE';
    NEW.justificativa_gps := FORMAT('Fora do perimetro: %s m da obra (limite %s m).',
                                    v_distancia_m, v_raio_m);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- DROP antes do CREATE para o script de deploy poder rodar quantas vezes quiser.
DROP TRIGGER IF EXISTS trg_classificar_diario_gps ON tb_diario_obra;

CREATE TRIGGER trg_classificar_diario_gps
BEFORE INSERT ON tb_diario_obra
FOR EACH ROW
EXECUTE FUNCTION fn_classificar_diario_gps();
