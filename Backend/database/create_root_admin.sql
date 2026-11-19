BEGIN;

DO $$
BEGIN
  IF LOWER(CURRENT_DATABASE()) <> 'pgg_db' THEN
    RAISE EXCEPTION 'Execute este script ligado à base pgg_db (base atual: %).', CURRENT_DATABASE();
  END IF;
END
$$;

-- A palavra-passe deste administrador vem de PGG_ADMIN_PASSWORD no Render.
INSERT INTO users (id, name, email, role, is_active)
VALUES ('pgg-root-admin', 'Administrador PGG', 'admin@portalgospel.gw', 'admin', TRUE)
ON CONFLICT (LOWER(email))
DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  is_active = TRUE
RETURNING id, name, email, role, is_active;

COMMIT;
