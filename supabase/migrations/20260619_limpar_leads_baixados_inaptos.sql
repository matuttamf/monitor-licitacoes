-- Remove leads BAIXADOS e INAPTOS do banco — situações irreversíveis que só ocupam espaço.
-- SUSPENSA é mantida (pode regularizar).

DELETE FROM public.leads
WHERE UPPER(situacao) IN ('BAIXADA', 'INAPTA');
