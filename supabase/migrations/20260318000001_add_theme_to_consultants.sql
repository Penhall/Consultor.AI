ALTER TABLE consultants
ADD COLUMN IF NOT EXISTS theme VARCHAR(20) NOT NULL DEFAULT 'corporate'
CHECK (theme IN ('corporate', 'noturno', 'moderno', 'classico'));
