-- ============================================================================
-- FUNCTION UDF: fn_distancia_metros
-- ----------------------------------------------------------------------------
-- Distancia em metros entre dois pontos geograficos (formula de Haversine).
--
-- Por que uma UDF e nao uma consulta repetida: a distancia entre o diario e a
-- obra e usada em tres lugares diferentes (o trigger que classifica o registro,
-- a view de registros fora do perimetro e a procedure de auditoria em lote).
-- Concentrar a formula em um lugar so garante que os tres concordem.
--
-- IMMUTABLE porque a saida depende apenas dos argumentos: o Postgres pode
-- cachear o resultado e usar a funcao dentro de indices se preciso.
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_distancia_metros(
  p_lat1 DECIMAL(10,7),
  p_lon1 DECIMAL(10,7),
  p_lat2 DECIMAL(10,7),
  p_lon2 DECIMAL(10,7)
)
RETURNS DECIMAL(12,2) AS $$
DECLARE
  v_raio_terra_m CONSTANT DECIMAL := 6371000;
  v_dlat         DOUBLE PRECISION;
  v_dlon         DOUBLE PRECISION;
  v_a            DOUBLE PRECISION;
BEGIN
  -- Sem coordenada nao ha distancia: devolve NULL em vez de zero, porque zero
  -- significaria "esta exatamente no lugar" e seria uma mentira perigosa aqui.
  IF p_lat1 IS NULL OR p_lon1 IS NULL OR p_lat2 IS NULL OR p_lon2 IS NULL THEN
    RETURN NULL;
  END IF;

  v_dlat := RADIANS(p_lat2::DOUBLE PRECISION - p_lat1::DOUBLE PRECISION);
  v_dlon := RADIANS(p_lon2::DOUBLE PRECISION - p_lon1::DOUBLE PRECISION);

  v_a := SIN(v_dlat / 2) ^ 2
       + COS(RADIANS(p_lat1::DOUBLE PRECISION))
       * COS(RADIANS(p_lat2::DOUBLE PRECISION))
       * SIN(v_dlon / 2) ^ 2;

  RETURN ROUND((v_raio_terra_m * 2 * ASIN(SQRT(v_a)))::NUMERIC, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;
