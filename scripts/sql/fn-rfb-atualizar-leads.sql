-- Batch update de leads com dados da RFB.
-- Substitui o loop de N×7 queries individuais por 7 queries com arrays.
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
AS $$
BEGIN
  -- Sempre atualiza município e UF (corrige código IBGE antigo)
  UPDATE leads AS l
  SET
    municipio = v.municipio,
    uf        = v.uf
  FROM unnest(p_cnpjs, p_municipios, p_ufs) AS v(cnpj, municipio, uf)
  WHERE l.cnpj = v.cnpj
    AND l.status NOT IN ('descadastrado', 'usuario')
    AND (v.municipio IS NOT NULL OR v.uf IS NOT NULL);

  -- Preenche e-mail se nulo
  UPDATE leads AS l
  SET email = v.email
  FROM unnest(p_cnpjs, p_emails) AS v(cnpj, email)
  WHERE l.cnpj = v.cnpj
    AND v.email IS NOT NULL
    AND l.email IS NULL
    AND l.status NOT IN ('descadastrado', 'usuario');

  -- Preenche telefone se nulo
  UPDATE leads AS l
  SET telefone = v.telefone
  FROM unnest(p_cnpjs, p_telefones) AS v(cnpj, telefone)
  WHERE l.cnpj = v.cnpj
    AND v.telefone IS NOT NULL
    AND l.telefone IS NULL
    AND l.status NOT IN ('descadastrado', 'usuario');

  -- Preenche nome_fantasia se nulo
  UPDATE leads AS l
  SET nome_fantasia = v.nome_fantasia
  FROM unnest(p_cnpjs, p_nomes_fantasia) AS v(cnpj, nome_fantasia)
  WHERE l.cnpj = v.cnpj
    AND v.nome_fantasia IS NOT NULL
    AND l.nome_fantasia IS NULL
    AND l.status NOT IN ('descadastrado', 'usuario');

  -- Preenche porte se nulo
  UPDATE leads AS l
  SET porte = v.porte
  FROM unnest(p_cnpjs, p_portes) AS v(cnpj, porte)
  WHERE l.cnpj = v.cnpj
    AND v.porte IS NOT NULL
    AND l.porte IS NULL
    AND l.status NOT IN ('descadastrado', 'usuario');

  -- Preenche data_abertura se nulo
  UPDATE leads AS l
  SET data_abertura = v.data_abertura::date
  FROM unnest(p_cnpjs, p_datas_abertura) AS v(cnpj, data_abertura)
  WHERE l.cnpj = v.cnpj
    AND v.data_abertura IS NOT NULL
    AND l.data_abertura IS NULL
    AND l.status NOT IN ('descadastrado', 'usuario');

  -- Corrige razão social = CNPJ numérico (fallback antigo)
  UPDATE leads AS l
  SET razao_social = v.razao_social
  FROM unnest(p_cnpjs, p_razoes_sociais) AS v(cnpj, razao_social)
  WHERE l.cnpj = v.cnpj
    AND v.razao_social IS NOT NULL
    AND v.razao_social ~ '[a-zA-ZÀ-ÿ]'
    AND (l.razao_social IS NULL OR l.razao_social ~ '^\d+$')
    AND l.status NOT IN ('descadastrado', 'usuario');
END;
$$;
