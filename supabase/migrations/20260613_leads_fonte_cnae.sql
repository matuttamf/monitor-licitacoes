-- Corrige leads existentes da Receita Federal (CNAE) que ficaram com fonte=null
UPDATE leads SET fonte = 'cnae' WHERE origem = 'cnae' AND fonte IS NULL;
