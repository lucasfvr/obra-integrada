CREATE OR REPLACE FUNCTION calcular_custo_obra(p_id_obra INTEGER)
RETURNS DECIMAL(12,2) AS $$
DECLARE
  v_custo_material DECIMAL(12,2);
  v_custo_mao_obra DECIMAL(12,2);
  v_custo_taxas DECIMAL(12,2);
BEGIN
  -- Custo dos materiais consumidos (saídas de estoque)
  SELECT COALESCE(SUM(mo.quantidade * m.preco_unitario), 0)
  INTO v_custo_material
  FROM tb_movimentacao_estoque mo
  JOIN tb_estoque_obra eo ON mo.id_estoque = eo.id_estoque
  JOIN tb_material m ON eo.nome_material = m.nome
  WHERE eo.id_obra = p_id_obra AND mo.tipo = 'SAIDA';

  -- Custo dos materiais requisitados (requisições com quantidade usada)
  DECLARE
    v_custo_requisitado DECIMAL(12,2);
  BEGIN
    SELECT COALESCE(SUM(r.quantidade_usada * m.preco_unitario), 0)
    INTO v_custo_requisitado
    FROM tb_requisicao r
    JOIN tb_material_requisitado mr ON r.id_requisicao = mr.id_requisicao
    JOIN tb_material m ON mr.id_material = m.id_material
    WHERE r.id_obra = p_id_obra AND r.quantidade_usada IS NOT NULL;

    v_custo_material := v_custo_material + v_custo_requisitado;
  END;

  -- Custo da mão de obra (diárias pagas)
  SELECT COALESCE(SUM(p.valor_diaria * p.horas_trabalhadas / 8), 0)
  INTO v_custo_mao_obra
  FROM tb_rh_ponto_diaria p
  WHERE p.id_obra = p_id_obra AND p.status = 'APROVADO';

  -- Custos de taxas (do financeiro)
  SELECT COALESCE(SUM(f.valor), 0)
  INTO v_custo_taxas
  FROM tb_financeiro_obra f
  WHERE f.id_obra = p_id_obra AND f.tipo = 'TAXA';

  RETURN v_custo_material + v_custo_mao_obra + v_custo_taxas;
END;
$$ LANGUAGE plpgsql;