-- Relatório avançado de RH: Funcionários com certificações vencidas
-- trabalhando em obras de alto risco nos últimos 30 dias
SELECT
  u.id_usuario,
  u.nome,
  u.cpf,
  c.nome AS certificacao,
  c.data_validade,
  o.id_obra,
  o.nome AS obra,
  o.tipo_obra,
  (CURRENT_DATE - c.data_validade) AS dias_vencido,
  COUNT(p.id_ponto_diaria) AS pontos_recentes
FROM tb_usuario u
JOIN tb_certificacao c ON u.id_usuario = c.id_usuario
JOIN tb_rh_ponto_diaria p ON u.id_usuario = p.id_usuario
JOIN tb_obra o ON p.id_obra = o.id_obra
WHERE
  c.data_validade < CURRENT_DATE
  AND o.tipo_obra IN ('ELÉTRICA', 'ALTURA', 'CONFINAMENTO', 'TAQUELAGEM')  -- Obras de risco
  AND p.data_ponto >= CURRENT_DATE - INTERVAL '30 dias'
  AND u.status = 'ATIVO'
GROUP BY
  u.id_usuario, u.nome, u.cpf, c.nome, c.data_validade,
  o.id_obra, o.nome, o.tipo_obra
ORDER BY
  dias_vencido DESC, u.nome;