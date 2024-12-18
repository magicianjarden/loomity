-- Drop existing policies if they exist
do $$ 
begin
    -- Drop storage policies if bucket exists
    if exists (select from storage.buckets where id = 'document-assets') then
        drop policy if exists "Users can view their own document assets" on storage.objects;
        drop policy if exists "Users can upload document assets" on storage.objects;
        drop policy if exists "Users can update their document assets" on storage.objects;
        drop policy if exists "Users can delete their document assets" on storage.objects;
    end if;

    if exists (select from storage.buckets where id = 'document-covers') then
        drop policy if exists "Anyone can view document covers" on storage.objects;
        drop policy if exists "Users can upload document covers" on storage.objects;
        drop policy if exists "Users can update their document covers" on storage.objects;
        drop policy if exists "Users can delete their document covers" on storage.objects;
    end if;
end $$;

-- Create storage buckets
insert into storage.buckets (id, name, public)
values
    ('document-assets', 'document-assets', false),
    ('document-covers', 'document-covers', true)
on conflict (id) do nothing;

-- Helper function to check if user can access document assets
create or replace function storage_can_access_document_assets(object_name text, auth_uid uuid)
returns boolean as $$
declare
    doc_id uuid;
begin
    -- Extract document ID from the path (first segment)
    doc_id := (split_part(object_name, '/', 1))::uuid;
    return can_access_document(doc_id, auth_uid);
end;
$$ language plpgsql security definer;

-- Helper function to check if user can edit document assets
create or replace function storage_can_edit_document_assets(object_name text, auth_uid uuid)
returns boolean as $$
declare
    doc_id uuid;
begin
    -- Extract document ID from the path (first segment)
    doc_id := (split_part(object_name, '/', 1))::uuid;
    return has_document_permission(doc_id, auth_uid, 'edit');
end;
$$ language plpgsql security definer;

-- Set up storage policies for document-assets
create policy "Users can view their own document assets"
    on storage.objects for select
    using (
        bucket_id = 'document-assets'
        and (
            auth.uid() = owner
            or storage_can_access_document_assets(name, auth.uid())
        )
    );

create policy "Users can upload document assets"
    on storage.objects for insert
    with check (
        bucket_id = 'document-assets'
        and auth.uid() = owner
        and storage_can_edit_document_assets(name, auth.uid())
    );

create policy "Users can update their document assets"
    on storage.objects for update
    using (
        bucket_id = 'document-assets'
        and auth.uid() = owner
        and storage_can_edit_document_assets(name, auth.uid())
    );

create policy "Users can delete their document assets"
    on storage.objects for delete
    using (
        bucket_id = 'document-assets'
        and auth.uid() = owner
        and storage_can_edit_document_assets(name, auth.uid())
    );

-- Set up storage policies for document-covers (public bucket)
create policy "Anyone can view document covers"
    on storage.objects for select
    using (bucket_id = 'document-covers');

create policy "Users can upload document covers"
    on storage.objects for insert
    with check (
        bucket_id = 'document-covers'
        and auth.uid() = owner
        and storage_can_edit_document_assets(name, auth.uid())
    );

create policy "Users can update their document covers"
    on storage.objects for update
    using (
        bucket_id = 'document-covers'
        and auth.uid() = owner
        and storage_can_edit_document_assets(name, auth.uid())
    );

create policy "Users can delete their document covers"
    on storage.objects for delete
    using (
        bucket_id = 'document-covers'
        and auth.uid() = owner
        and storage_can_edit_document_assets(name, auth.uid())
    );
