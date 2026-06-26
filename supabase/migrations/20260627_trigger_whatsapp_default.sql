-- Propagar whatsapp do signup metadata para profiles (mesmo valor que telefone por padrão)
CREATE OR REPLACE FUNCTION profiles_set_defaults()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_meta  JSONB;
BEGIN
  SELECT email, raw_user_meta_data
    INTO user_email, user_meta
    FROM auth.users
   WHERE id = NEW.id;

  -- E-mail normalizado (anti-abuso)
  IF NEW.email_normalizado IS NULL AND user_email IS NOT NULL THEN
    NEW.email_normalizado := normalizar_email(user_email);
  END IF;

  -- Dados pessoais e de contato
  IF user_meta IS NOT NULL THEN
    IF NEW.nome      IS NULL AND user_meta ? 'nome'      THEN NEW.nome      := user_meta->>'nome';      END IF;
    IF NEW.telefone  IS NULL AND user_meta ? 'telefone'  THEN NEW.telefone  := user_meta->>'telefone';  END IF;
    IF NEW.whatsapp  IS NULL AND user_meta ? 'whatsapp'  THEN NEW.whatsapp  := user_meta->>'whatsapp';  END IF;

    -- Dados fiscais e endereço
    IF NEW.estado_uf     IS NULL AND user_meta ? 'estado_uf'     THEN NEW.estado_uf     := user_meta->>'estado_uf';     END IF;
    IF NEW.cnpj          IS NULL AND user_meta ? 'cnpj'          THEN NEW.cnpj          := user_meta->>'cnpj';          END IF;
    IF NEW.razao_social  IS NULL AND user_meta ? 'razao_social'  THEN NEW.razao_social  := user_meta->>'razao_social';  END IF;
    IF NEW.nome_fantasia IS NULL AND user_meta ? 'nome_fantasia' THEN NEW.nome_fantasia := user_meta->>'nome_fantasia'; END IF;
    IF NEW.ie            IS NULL AND user_meta ? 'ie'            THEN NEW.ie            := user_meta->>'ie';            END IF;
    IF NEW.cep           IS NULL AND user_meta ? 'cep'           THEN NEW.cep           := user_meta->>'cep';           END IF;
    IF NEW.logradouro    IS NULL AND user_meta ? 'logradouro'    THEN NEW.logradouro    := user_meta->>'logradouro';    END IF;
    IF NEW.numero        IS NULL AND user_meta ? 'numero'        THEN NEW.numero        := user_meta->>'numero';        END IF;
    IF NEW.complemento   IS NULL AND user_meta ? 'complemento'  THEN NEW.complemento  := user_meta->>'complemento';   END IF;
    IF NEW.bairro        IS NULL AND user_meta ? 'bairro'        THEN NEW.bairro        := user_meta->>'bairro';        END IF;
    IF NEW.cidade        IS NULL AND user_meta ? 'cidade'        THEN NEW.cidade        := user_meta->>'cidade';        END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;
