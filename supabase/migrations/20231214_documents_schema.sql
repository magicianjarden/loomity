-- Drop existing policies if they exist
do $$ 
begin
    -- Drop policies for documents table if it exists
    if exists (select from pg_tables where schemaname = 'public' and tablename = 'documents') then
        drop policy if exists "Users can view their own documents" on public.documents;
        drop policy if exists "Users can insert their own documents" on public.documents;
        drop policy if exists "Users can update their own documents" on public.documents;
        drop policy if exists "Users can delete their own documents" on public.documents;
        drop policy if exists "Users can view document blocks" on public.document_blocks;
        drop policy if exists "Users can insert document blocks" on public.document_blocks;
        drop policy if exists "Users can update document blocks" on public.document_blocks;
        drop policy if exists "Users can delete document blocks" on public.document_blocks;
        drop policy if exists "Users can view document comments" on public.document_comments;
        drop policy if exists "Users can insert document comments" on public.document_comments;
        drop policy if exists "Users can update their own comments" on public.document_comments;
        drop policy if exists "Users can delete their own comments" on public.document_comments;
        drop policy if exists "Users can view document permissions" on public.document_permissions;
        drop policy if exists "Users can manage document permissions" on public.document_permissions;
    end if;

    -- Drop policies for document_blocks table if it exists
    if exists (select from pg_tables where schemaname = 'public' and tablename = 'document_blocks') then
        drop policy if exists "Users can view document blocks" on public.document_blocks;
        drop policy if exists "Users can insert document blocks" on public.document_blocks;
        drop policy if exists "Users can update document blocks" on public.document_blocks;
        drop policy if exists "Users can delete document blocks" on public.document_blocks;
    end if;

    -- Drop policies for document_comments table if it exists
    if exists (select from pg_tables where schemaname = 'public' and tablename = 'document_comments') then
        drop policy if exists "Users can view document comments" on public.document_comments;
        drop policy if exists "Users can insert document comments" on public.document_comments;
        drop policy if exists "Users can update their own comments" on public.document_comments;
        drop policy if exists "Users can delete their own comments" on public.document_comments;
    end if;

    -- Drop policies for document_permissions table if it exists
    if exists (select from pg_tables where schemaname = 'public' and tablename = 'document_permissions') then
        drop policy if exists "Users can view document permissions" on public.document_permissions;
        drop policy if exists "Users can manage document permissions" on public.document_permissions;
    end if;
end $$;

-- Create documents table
create table if not exists public.documents (
    id uuid default gen_random_uuid() primary key,
    title text not null default 'Untitled',
    content jsonb default '{}',
    owner_id uuid references auth.users(id) on delete cascade not null,
    parent_id uuid references public.documents(id) on delete set null,
    is_template boolean default false,
    icon text,
    cover_image text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create document_blocks table
create table if not exists public.document_blocks (
    id uuid default gen_random_uuid() primary key,
    document_id uuid references public.documents(id) on delete cascade not null,
    type text not null,
    content jsonb not null default '{}',
    position integer not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create document_comments table
create table if not exists public.document_comments (
    id uuid default gen_random_uuid() primary key,
    document_id uuid references public.documents(id) on delete cascade not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    content text not null,
    resolved boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create document_permissions table
create table if not exists public.document_permissions (
    id uuid default gen_random_uuid() primary key,
    document_id uuid references public.documents(id) on delete cascade not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    permission_level text not null check (permission_level in ('view', 'comment', 'edit', 'admin')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique (document_id, user_id)
);

-- Create indexes
create index if not exists documents_owner_id_idx on public.documents(owner_id);
create index if not exists documents_parent_id_idx on public.documents(parent_id);
create index if not exists document_blocks_document_id_idx on public.document_blocks(document_id);
create index if not exists document_blocks_position_idx on public.document_blocks(position);
create index if not exists document_comments_document_id_idx on public.document_comments(document_id);
create index if not exists document_comments_user_id_idx on public.document_comments(user_id);
create index if not exists document_permissions_document_id_idx on public.document_permissions(document_id);
create index if not exists document_permissions_user_id_idx on public.document_permissions(user_id);

-- Note: Triggers are already defined in 20231214_create_documents_tables.sql
