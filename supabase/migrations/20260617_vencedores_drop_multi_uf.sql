-- Remove a versão com p_ufs (6 params) que criou ambiguidade.
-- Mantém apenas a versão original de 5 parâmetros.
DROP FUNCTION IF EXISTS buscar_vencedores_licitacoes(text,text,integer,integer,integer,text[]);
