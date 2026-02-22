-- ===========================================
-- Supabase Self-Hosted - Role Initialization
-- ===========================================
-- Este script cria roles, schemas e funcoes stub necessarias.
-- As tabelas auth serao criadas pelo GoTrue automaticamente.
-- Deve ser executado ANTES das migrations da aplicacao.
--
-- IMPORTANTE: NAO pre-popular auth.schema_migrations!
-- GoTrue deve executar suas proprias migrations para criar
-- todas as tabelas e colunas que precisa.
--
-- Roles criados:
-- - anon: Acesso anonimo (sem autenticacao)
-- - authenticated: Usuarios autenticados
-- - service_role: Acesso administrativo (backend)
-- - authenticator: Role usado pelo PostgREST
-- - supabase_admin: Superuser do Supabase
-- - supabase_auth_admin: Admin do GoTrue
-- - supabase_storage_admin: Admin do Storage

-- Criar extensoes necessarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===========================================
-- Criar roles base
-- ===========================================

-- Role anonimo
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon NOLOGIN NOINHERIT;
    END IF;
END
$$;

-- Role autenticado
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated NOLOGIN NOINHERIT;
    END IF;
END
$$;

-- Role de servico (admin)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN
        CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
    END IF;
END
$$;

-- ===========================================
-- Criar roles de admin
-- ===========================================

-- Supabase admin (superuser)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_admin') THEN
        CREATE ROLE supabase_admin LOGIN SUPERUSER CREATEDB CREATEROLE REPLICATION BYPASSRLS PASSWORD 'postgres';
    END IF;
END
$$;

-- Auth admin (para GoTrue)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
        CREATE ROLE supabase_auth_admin NOINHERIT LOGIN PASSWORD 'postgres';
    END IF;
END
$$;

-- Storage admin
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_storage_admin') THEN
        CREATE ROLE supabase_storage_admin NOINHERIT LOGIN PASSWORD 'postgres';
    END IF;
END
$$;

-- ===========================================
-- Authenticator (PostgREST)
-- ===========================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticator') THEN
        CREATE ROLE authenticator NOINHERIT LOGIN PASSWORD 'postgres';
    END IF;
END
$$;

-- Permitir que authenticator assuma outros roles
GRANT anon TO authenticator;
GRANT authenticated TO authenticator;
GRANT service_role TO authenticator;

-- ===========================================
-- Criar schemas necessarios
-- ===========================================

-- Schema auth (GoTrue) - tabelas serao criadas pelo GoTrue
CREATE SCHEMA IF NOT EXISTS auth;
GRANT ALL ON SCHEMA auth TO postgres;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;

-- ===========================================
-- Tabela auth.users stub MINIMA
-- Necessaria APENAS para que as foreign keys das migrations
-- da aplicacao (consultants.user_id -> auth.users.id) funcionem.
-- GoTrue vai adicionar as colunas faltantes via ALTER TABLE.
-- ===========================================
CREATE TABLE IF NOT EXISTS auth.users (
    instance_id uuid,
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    aud varchar(255),
    role varchar(255),
    email varchar(255) UNIQUE,
    encrypted_password varchar(255),
    email_confirmed_at timestamptz,
    invited_at timestamptz,
    confirmation_token varchar(255),
    confirmation_sent_at timestamptz,
    recovery_token varchar(255),
    recovery_sent_at timestamptz,
    email_change_token_new varchar(255),
    email_change varchar(255),
    email_change_sent_at timestamptz,
    last_sign_in_at timestamptz,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    phone text UNIQUE,
    phone_confirmed_at timestamptz,
    phone_change text,
    phone_change_token varchar(255),
    phone_change_sent_at timestamptz,
    confirmed_at timestamptz,
    email_change_token_current varchar(255),
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamptz,
    reauthentication_token varchar(255),
    reauthentication_sent_at timestamptz,
    is_sso_user boolean DEFAULT false,
    deleted_at timestamptz,
    is_anonymous boolean DEFAULT false
);

-- Grant auth admin ownership of auth tables
ALTER TABLE auth.users OWNER TO supabase_auth_admin;

CREATE INDEX IF NOT EXISTS users_instance_id_idx ON auth.users (instance_id);
CREATE INDEX IF NOT EXISTS users_instance_id_email_idx ON auth.users (instance_id, email);

-- ===========================================
-- GoTrue gerencia as demais tabelas auth
-- NAO criar stubs de: refresh_tokens, sessions, identities,
-- mfa_factors, mfa_challenges, etc.
-- NAO pre-popular auth.schema_migrations.
-- GoTrue rodara TODAS as suas migrations no primeiro boot.
-- ===========================================

-- Funcao auth.uid() temporaria (sera sobrescrita pelo GoTrue)
-- Necessaria para que as migrations de RLS possam ser aplicadas
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
    SELECT COALESCE(
        NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid,
        '00000000-0000-0000-0000-000000000000'::uuid
    )
$$;

-- Funcao auth.role() temporaria (sera sobrescrita pelo GoTrue)
CREATE OR REPLACE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
    SELECT COALESCE(
        NULLIF(current_setting('request.jwt.claim.role', true), ''),
        'anon'
    )
$$;

-- Funcao auth.jwt() temporaria (sera sobrescrita pelo GoTrue)
-- Necessaria para RLS policies que verificam role via JWT claims
CREATE OR REPLACE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
    SELECT COALESCE(
        NULLIF(current_setting('request.jwt.claims', true), ''),
        '{}'
    )::jsonb
$$;

-- Schema storage
CREATE SCHEMA IF NOT EXISTS storage;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin;
GRANT USAGE ON SCHEMA storage TO anon, authenticated, service_role;

-- Schema realtime
CREATE SCHEMA IF NOT EXISTS _realtime;
GRANT ALL ON SCHEMA _realtime TO postgres;

-- Schema GraphQL
CREATE SCHEMA IF NOT EXISTS graphql_public;
GRANT USAGE ON SCHEMA graphql_public TO anon, authenticated, service_role;

-- ===========================================
-- Permissoes no schema public
-- ===========================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- Permissoes padrao para novas tabelas
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- ===========================================
-- Tabelas minimas de Storage
-- ===========================================
CREATE TABLE IF NOT EXISTS storage.buckets (
    id text PRIMARY KEY,
    name text UNIQUE NOT NULL,
    owner uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[]
);

CREATE TABLE IF NOT EXISTS storage.objects (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    bucket_id text REFERENCES storage.buckets(id),
    name text,
    owner uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    last_accessed_at timestamptz DEFAULT now(),
    metadata jsonb,
    version text,
    owner_id text
);

-- Permissoes storage
GRANT ALL ON storage.buckets TO supabase_storage_admin;
GRANT ALL ON storage.objects TO supabase_storage_admin;
GRANT SELECT ON storage.buckets TO anon, authenticated, service_role;
GRANT ALL ON storage.objects TO anon, authenticated, service_role;

-- ===========================================
-- Log de conclusao
-- ===========================================
DO $$
BEGIN
    RAISE NOTICE 'Supabase roles, schemas, and stub functions initialized.';
    RAISE NOTICE 'GoTrue will create auth tables on first startup.';
END
$$;
