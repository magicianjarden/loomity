-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Documents table
create table if not exists documents (
    id uuid default uuid_generate_v4() primary key,
    title text not null,
    content jsonb default '{}'::jsonb,
    parent_id uuid references documents(id) on delete cascade,
    owner_id uuid references auth.users(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    is_template boolean default false not null,
    icon text,
    cover_image text,
    archived boolean default false not null
);

-- Document blocks table for rich text content
create table if not exists document_blocks (
    id uuid default uuid_generate_v4() primary key,
    document_id uuid references documents(id) on delete cascade not null,
    type text not null,
    content jsonb not null,
    position integer not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Comments table
create table if not exists comments (
    id uuid default uuid_generate_v4() primary key,
    document_id uuid references documents(id) on delete cascade not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    resolved boolean default false not null,
    parent_id uuid references comments(id) on delete cascade
);

-- Document permissions table
create table if not exists document_permissions (
    id uuid default uuid_generate_v4() primary key,
    document_id uuid references documents(id) on delete cascade not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    permission_level text not null check (permission_level in ('view', 'comment', 'edit', 'admin')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(document_id, user_id)
);

-- Create indexes for better query performance
create index if not exists documents_owner_id_idx on documents(owner_id);
create index if not exists documents_parent_id_idx on documents(parent_id);
create index if not exists document_blocks_document_id_position_idx on document_blocks(document_id, position);
create index if not exists comments_document_id_idx on comments(document_id);
create index if not exists document_permissions_document_id_user_id_idx on document_permissions(document_id, user_id);

-- Add updated_at trigger function
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Add triggers for updated_at
do $$
begin
    if not exists (select 1 from pg_trigger where tgname = 'update_documents_updated_at') then
        create trigger update_documents_updated_at
            before update on documents
            for each row
            execute function update_updated_at_column();
    end if;

    if not exists (select 1 from pg_trigger where tgname = 'update_document_blocks_updated_at') then
        create trigger update_document_blocks_updated_at
            before update on document_blocks
            for each row
            execute function update_updated_at_column();
    end if;

    if not exists (select 1 from pg_trigger where tgname = 'update_comments_updated_at') then
        create trigger update_comments_updated_at
            before update on comments
            for each row
            execute function update_updated_at_column();
    end if;
end $$;

-- Helper functions for permission checks
create or replace function has_document_permission(doc_id uuid, user_id uuid, required_level text)
returns boolean as $$
begin
    return exists (
        select 1 
        from document_permissions 
        where document_id = doc_id 
        and user_id = user_id
        and (
            permission_level = required_level 
            or permission_level = 'admin'
            or (required_level = 'view' and permission_level in ('comment', 'edit', 'admin'))
            or (required_level = 'comment' and permission_level in ('edit', 'admin'))
        )
    );
end;
$$ language plpgsql security definer;

create or replace function can_access_document(doc_id uuid, user_id uuid)
returns boolean as $$
begin
    return exists (
        select 1 
        from documents 
        where id = doc_id 
        and (owner_id = user_id or has_document_permission(id, user_id, 'view'))
    );
end;
$$ language plpgsql security definer;

-- Row Level Security Policies

-- Enable RLS
alter table documents enable row level security;
alter table document_blocks enable row level security;
alter table comments enable row level security;
alter table document_permissions enable row level security;

-- Drop existing policies if they exist
do $$
begin
    -- Documents policies
    drop policy if exists "Users can view documents they have access to" on documents;
    drop policy if exists "Users can insert their own documents" on documents;
    drop policy if exists "Users can update documents they own or have edit access to" on documents;
    drop policy if exists "Users can delete documents they own or have admin access to" on documents;

    -- Document blocks policies
    drop policy if exists "Users can view blocks of documents they have access to" on document_blocks;
    drop policy if exists "Users can insert blocks in documents they can edit" on document_blocks;
    drop policy if exists "Users can update blocks in documents they can edit" on document_blocks;
    drop policy if exists "Users can delete blocks in documents they can edit" on document_blocks;

    -- Comments policies
    drop policy if exists "Users can view comments on documents they have access to" on comments;
    drop policy if exists "Users can insert comments on documents they can comment on" on comments;
    drop policy if exists "Users can update their own comments" on comments;
    drop policy if exists "Users can delete their own comments" on comments;

    -- Document permissions policies
    drop policy if exists "Users can view document permissions they own or admin" on document_permissions;
    drop policy if exists "Users can manage document permissions they own" on document_permissions;
end $$;

-- Documents policies
create policy "Users can view documents they have access to"
    on documents for select
    using (owner_id = auth.uid() or has_document_permission(id, auth.uid(), 'view'));

create policy "Users can insert their own documents"
    on documents for insert
    with check (auth.uid() = owner_id);

create policy "Users can update documents they own or have edit access to"
    on documents for update
    using (owner_id = auth.uid() or has_document_permission(id, auth.uid(), 'edit'));

create policy "Users can delete documents they own or have admin access to"
    on documents for delete
    using (owner_id = auth.uid() or has_document_permission(id, auth.uid(), 'admin'));

-- Document blocks policies
create policy "Users can view blocks of documents they have access to"
    on document_blocks for select
    using (can_access_document(document_id, auth.uid()));

create policy "Users can insert blocks in documents they can edit"
    on document_blocks for insert
    with check (has_document_permission(document_id, auth.uid(), 'edit'));

create policy "Users can update blocks in documents they can edit"
    on document_blocks for update
    using (has_document_permission(document_id, auth.uid(), 'edit'));

create policy "Users can delete blocks in documents they can edit"
    on document_blocks for delete
    using (has_document_permission(document_id, auth.uid(), 'edit'));

-- Comments policies
create policy "Users can view comments on documents they have access to"
    on comments for select
    using (can_access_document(document_id, auth.uid()));

create policy "Users can insert comments on documents they can comment on"
    on comments for insert
    with check (
        auth.uid() = user_id 
        and (
            can_access_document(document_id, auth.uid())
            or has_document_permission(document_id, auth.uid(), 'comment')
        )
    );

create policy "Users can update their own comments"
    on comments for update
    using (auth.uid() = user_id);

create policy "Users can delete their own comments"
    on comments for delete
    using (auth.uid() = user_id);

-- Document permissions policies
create policy "Users can view document permissions they own"
    on document_permissions for select
    using (
        exists (
            select 1 
            from documents d 
            where d.id = document_id 
            and d.owner_id = auth.uid()
        )
    );

create policy "Users can manage document permissions they own"
    on document_permissions for all
    using (
        exists (
            select 1 
            from documents d 
            where d.id = document_id 
            and d.owner_id = auth.uid()
        )
    );
