-- Migração opcional: adicionar flag "Possui limite máximo de alunos" em checkin.event
-- Execute apenas se a tabela checkin.event já existir sem a coluna has_max_participants.

ALTER TABLE checkin.event ADD COLUMN IF NOT EXISTS has_max_participants boolean NOT NULL DEFAULT true;
ALTER TABLE checkin.event ALTER COLUMN max_participants SET DEFAULT 0;
