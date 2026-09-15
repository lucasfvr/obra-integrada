-- ============================================================================
-- VIEW ESTRATEGICA: vw_diario_fora_perimetro
-- ----------------------------------------------------------------------------
-- Pergunta que responde: "algum registro foi feito longe da obra?"
--
-- Esta e a consulta estrategica do projeto, e a unica que usa o dado que o
-- sistema ja coleta e nunca leu: as coordenadas gravadas em cada registro do
-- diario (tb_diario_obra.latitude / longitude, colunas que existem desde a
-- migration de auditoria geografica).
--
-- Um registro feito a 4 km da obra nao e necessariamente fraude -- pode ser GPS
-- ruim ou celular sem sinal. Mas e o unico jeito de a construtora saber que
-- aconteceu, e a diferenca entre um diario que serve como prova e um que nao
-- serve. Por isso a view classifica a gravidade em vez de acusar.
--
-- Usa a UDF fn_distancia_metros para a formula nao divergir do trigger.
-- ============================================================================

CREATE OR REPLACE VIEW vw_diario_fora_perimetro AS
SELECT
  d.id_diario,
  d.data_registro,
  o.id_obra,
  o.nome                                          AS obra,
  u.id_usuario,
  u.nome                                          AS registrado_por,
  u.funcao,
  d.status_auditoria,
  fn_distancia_metros(d.latitude, d.longitude, o.latitude, o.longitude) AS distancia_m,
  ROUND(
    fn_distancia_metros(d.latitude, d.longitude, o.latitude, o.longitude) / 1000, 2
  )                                               AS distancia_km,
  CASE
    WHEN fn_distancia_metros(d.latitude, d.longitude, o.latitude, o.longitude) > 5000 THEN 'GRAVE'
    WHEN fn_distancia_metros(d.latitude, d.longitude, o.latitude, o.longitude) > 1000 THEN 'ALTO'
    ELSE 'LEVE'
  END                                             AS gravidade,
  d.justificativa_gps,
  (d.foto_url IS NOT NULL)                        AS tem_foto,
  LEFT(d.descricao, 120)                          AS descricao_resumida
FROM tb_diario_obra d
JOIN tb_obra   o ON o.id_obra    = d.id_obra
JOIN tb_usuario u ON u.id_usuario = d.id_usuario
WHERE d.latitude  IS NOT NULL
  AND d.longitude IS NOT NULL
  AND o.latitude  IS NOT NULL
  AND o.longitude IS NOT NULL
  AND fn_distancia_metros(d.latitude, d.longitude, o.latitude, o.longitude) > 150;
