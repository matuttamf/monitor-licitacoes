-- Batch update de leads com dados da RFB.
-- 1 único UPDATE em vez de 7 separados → 7x menos I/O e trigger disparado 1x por linha.
-- Rodar no Supabase SQL Editor.

CREATE OR REPLACE FUNCTION rfb_atualizar_leads(
  p_cnpjs          text[],
  p_municipios     text[],
  p_ufs            text[],
  p_emails         text[],
  p_telefones      text[],
  p_nomes_fantasia text[],
  p_portes         text[],
  p_datas_abertura text[],
  p_razoes_sociais text[]
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
SET statement_timeout = '55s'
AS $$
BEGIN
  UPDATE leads AS l
  SET
    -- Município e UF sempre atualizados (corrige código IBGE antigo)
    municipio     = CASE WHEN v.municipio IS NOT NULL THEN v.municipio ELSE l.municipio END,
    uf            = CASE WHEN v.uf IS NOT NULL THEN v.uf ELSE l.uf END,
    -- Demais campos: preenche apenas se nulo no banco
    email         = CASE WHEN v.email IS NOT NULL AND l.email IS NULL THEN v.email ELSE l.email END,
    telefone      = CASE WHEN v.telefone IS NOT NULL AND l.telefone IS NULL THEN v.telefone ELSE l.telefone END,
    nome_fantasia = CASE WHEN v.nome_fantasia IS NOT NULL AND l.nome_fantasia IS NULL THEN v.nome_fantasia ELSE l.nome_fantasia END,
    porte         = CASE WHEN v.porte IS NOT NULL AND l.porte IS NULL THEN v.porte ELSE l.porte END,
    data_abertura = CASE WHEN v.data_abertura IS NOT NULL AND l.data_abertura IS NULL THEN v.data_abertura::date ELSE l.data_abertura END,
    razao_social  = CASE
                      WHEN v.razao_social IS NOT NULL
                        AND v.razao_social ~ '[a-zA-ZÀ-ÿ]'
                        AND (l.razao_social IS NULL OR l.razao_social ~ '^\d+$')
                      THEN v.razao_social
                      ELSE l.razao_social
                    END
  FROM unnest(
    p_cnpjs, p_municipios, p_ufs, p_emails, p_telefones,
    p_nomes_fantasia, p_portes, p_datas_abertura, p_razoes_sociais
  ) AS v(cnpj, municipio, uf, email, telefone, nome_fantasia, porte, data_abertura, razao_social)
  WHERE l.cnpj = v.cnpj
    AND l.status NOT IN ('descadastrado', 'usuario');
END;
$$;
