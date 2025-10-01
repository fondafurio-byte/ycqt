-- Creazione della tabella public.societa_sportive
create table public.societa_sportive (
  id uuid not null default gen_random_uuid(),
  nome_completo text not null,
  nome_breve text not null,
  token text not null,
  logo text null default '🏀'::text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint societa_sportive_pkey primary key (id),
  constraint societa_sportive_nome_completo_key unique (nome_completo),
  constraint societa_sportive_token_key unique (token)
) TABLESPACE pg_default;

-- Funzione per generare un token casuale per la società
create or replace function generate_societa_token()
returns text
language plpgsql
as $$
declare
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i integer;
begin
  for i in 1..8 loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  end loop;
  return result;
end;
$$;

-- Trigger per generare automaticamente il token della società
create or replace function set_societa_token()
returns trigger
language plpgsql
as $$
begin
  if new.token is null then
    new.token := generate_societa_token();
  end if;
  return new;
end;
$$;

create trigger trigger_set_societa_token
before insert on public.societa_sportive
for each row
execute function set_societa_token();

-- Creazione della tabella public.profiles
create table public.profiles (
  id uuid not null,
  email text not null,
  full_name text null,
  role text not null default 'user'::text,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  username text not null,
  categories text null default '[]'::text,
  societa_id uuid null,
  constraint profiles_pkey primary key (id),
  constraint profiles_email_key unique (email),
  constraint profiles_id_fkey foreign key (id) references auth.users(id) on delete cascade,
  constraint profiles_societa_id_fkey foreign key (societa_id) references societa_sportive(id),
  constraint profiles_role_check check (
    (
      role = any (
        array[
          'admin'::text,
          'edit'::text,
          'user'::text,
          'coach'::text,
          'atleta'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

-- Creazione degli indici
create unique index if not exists profiles_username_unique 
  on public.profiles using btree (username) 
  tablespace pg_default;

create index if not exists idx_profiles_role 
  on public.profiles using btree (role) 
  tablespace pg_default;

-- Funzione per aggiornare il timestamp updated_at
create or replace function update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger per aggiornare updated_at
create trigger update_profiles_updated_at
  before update on profiles
  for each row
  execute function update_updated_at_column();
