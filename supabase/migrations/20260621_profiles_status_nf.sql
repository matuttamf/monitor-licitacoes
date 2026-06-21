ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS status_nf text NOT NULL DEFAULT 'pendente'
  CHECK (status_nf IN ('pendente', 'emitida', 'enviada', 'cancelada'));
