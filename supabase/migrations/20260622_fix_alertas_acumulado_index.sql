-- Corrige índice da migration 20260621 que referenciava profile_id (não existe em alertas)
-- alertas não têm profile_id — o usuário é rastreado via keyword_id → keywords.user_id

DROP INDEX IF EXISTS alertas_licitacao_str_profile_idx;

-- Índice correto: por keyword_id + licitacao_id_str (usado no stats/roi)
CREATE INDEX IF NOT EXISTS alertas_licitacao_str_keyword_idx ON alertas(keyword_id, licitacao_id_str);
