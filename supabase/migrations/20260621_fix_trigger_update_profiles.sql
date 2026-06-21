-- O trigger trg_profiles_set_defaults disparava em UPDATE além de INSERT,
-- revertendo status, plano e outros campos para defaults toda vez que o sync
-- ou qualquer outro código fazia um UPDATE no perfil.
-- Correção: trigger restrito a INSERT apenas (defaults só fazem sentido na criação).
DROP TRIGGER IF EXISTS trg_profiles_set_defaults ON profiles;

CREATE TRIGGER trg_profiles_set_defaults
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION profiles_set_defaults();
