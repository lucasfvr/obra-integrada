-- ============================================================================
-- TRIGGER: trigger_atualizar_status_obra  (AFTER UPDATE em tb_etapa)
-- ----------------------------------------------------------------------------
-- Quando a ultima etapa pendente de uma obra e concluida, a obra inteira passa
-- a "Concluída" e ganha data de termino.
--
-- CONSERTADO EM 11/09/2026 -- a versao anterior tinha tres defeitos:
--
--   1) STATUS INVERTIDO. O comentario afirmava "id_status = 3 significa
--      CONCLUÍDO" e marcava a obra com id_status = 4 = "FINALIZADO". Mas o seed
--      (src/prisma/seed.js) define STATUS_NAMES nesta ordem:
--         1 Planejamento | 2 Em Andamento | 3 Pausada | 4 Concluída
--      ou seja: 3 e "Pausada" e nao existe id 5. O efeito real era que, quando
--      todas as etapas ficavam PAUSADAS, a obra era marcada como concluida e
--      recebia data de termino de hoje.
--
--   2) ETAPA SEM STATUS CONTAVA COMO CONCLUIDA. A condicao "id_status != 3"
--      resulta em NULL quando id_status e nulo, e NULL nao entra no COUNT.
--      Como tb_etapa.id_status e opcional (Int?), bastava uma etapa sem status
--      para a obra ser fechada. Agora usa IS DISTINCT FROM, que trata nulo
--      como "diferente de concluida" -- o lado conservador.
--
--   3) DISPARAVA EM QUALQUER UPDATE. Alterar o nome de uma etapa reexecutava a
--      verificacao inteira. Agora so roda quando o status realmente muda.
--
-- Nada disso foi percebido antes porque nunca houve dado no banco para revelar:
-- o seed cria 2 etapas e nenhuma transicao de status.
-- ============================================================================

CREATE OR REPLACE FUNCTION atualizar_status_obra_apenas()
RETURNS TRIGGER AS $$
DECLARE
  v_status_concluida CONSTANT INTEGER := 4;  -- 'Concluída' em tb_status
  v_pendentes        INTEGER;
BEGIN
  IF NEW.id_obra IS NULL THEN
    RETURN NEW;
  END IF;

  -- Quantas etapas desta obra ainda NAO estao concluidas.
  -- IS DISTINCT FROM: etapa com status nulo conta como pendente.
  SELECT COUNT(*)
    INTO v_pendentes
    FROM tb_etapa e
   WHERE e.id_obra = NEW.id_obra
     AND e.id_status IS DISTINCT FROM v_status_concluida;

  IF v_pendentes = 0 THEN
    UPDATE tb_obra
       SET id_status         = v_status_concluida,
           data_termino_real = COALESCE(data_termino_real, CURRENT_DATE)
     WHERE id_obra = NEW.id_obra
       AND id_status IS DISTINCT FROM v_status_concluida;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- DROP antes do CREATE para o deploy poder rodar quantas vezes for preciso.
DROP TRIGGER IF EXISTS trigger_atualizar_status_obra ON tb_etapa;

-- WHEN: so reavalia se o status da etapa mudou de fato.
CREATE TRIGGER trigger_atualizar_status_obra
AFTER UPDATE ON tb_etapa
FOR EACH ROW
WHEN (OLD.id_status IS DISTINCT FROM NEW.id_status)
EXECUTE FUNCTION atualizar_status_obra_apenas();
