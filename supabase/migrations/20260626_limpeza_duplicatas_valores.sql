-- ════════════════════════════════════════════════════════════════════════════
-- Limpeza única de dados legados em `licitacoes`:
--   A. Zera valores absurdos (dado-fonte corrompido — ex.: R$ 10 trilhões).
--   B. Remove duplicatas geradas pelo fallback Math.random() dos scrapers
--      (mesmo edital virou várias linhas com numero_edital aleatório).
--
-- As correções de código (lib/scrapers/salvar.ts) impedem NOVAS ocorrências.
-- Este script trata o que já está gravado. Seguro re-rodar (idempotente).
-- ════════════════════════════════════════════════════════════════════════════

-- ── A. Valores absurdos → NULL ("valor não informado") ──────────────────────
UPDATE licitacoes
   SET valor_estimado = NULL
 WHERE valor_estimado IS NOT NULL
   AND (valor_estimado <= 0 OR valor_estimado > 100000000000);  -- > R$ 100 bi

-- ── B. Duplicatas de conteúdo causadas por id aleatório ─────────────────────
-- Estratégia conservadora: só mexe em grupos (fonte, órgão, objeto, data) que
-- contêm AO MENOS UMA linha com numero_edital aleatório (artefato do bug) E têm
-- mais de uma linha. Mantém a melhor sobrevivente:
--   1) prefere id ESTÁVEL (não-aleatório) a id aleatório;
--   2) entre iguais, a coleta mais recente.
-- alertas.licitacao_id é ON DELETE CASCADE → alertas das linhas removidas saem
-- junto; o sobrevivente é re-alertado normalmente no próximo ciclo de matching.
WITH grupos AS (
  SELECT id, fonte, orgao, objeto, data_abertura, coletado_em,
         (numero_edital ~ '0\.[0-9]{4,}') AS aleatorio  -- "...-0.8342913" => Math.random()
    FROM licitacoes
),
afetados AS (
  SELECT fonte, orgao, objeto, data_abertura
    FROM grupos
   GROUP BY fonte, orgao, objeto, data_abertura
  HAVING bool_or(aleatorio) AND count(*) > 1
),
ranked AS (
  SELECT g.id,
         row_number() OVER (
           PARTITION BY g.fonte, g.orgao, g.objeto, g.data_abertura
           ORDER BY g.aleatorio ASC, g.coletado_em DESC, g.id
         ) AS rn
    FROM grupos g
    JOIN afetados a
      ON  a.fonte = g.fonte
      AND a.orgao = g.orgao
      AND a.objeto = g.objeto
      AND a.data_abertura IS NOT DISTINCT FROM g.data_abertura
)
DELETE FROM licitacoes
 WHERE id IN (SELECT id FROM ranked WHERE rn > 1);
