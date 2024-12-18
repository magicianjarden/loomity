-- Create enum types for marketplace items
create type marketplace_item_type as enum ('plugin', 'theme');

-- Create the marketplace items table
create table marketplace_items (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    description text,
    type marketplace_item_type not null,
    tags text[] default '{}',
    author_id uuid references auth.users not null,
    version text not null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    downloads integer default 0,
    rating float default 0,
    review_count integer default 0,
    preview_images text[] default '{}',
    metadata jsonb default '{}'::jsonb,
    content jsonb not null,
    search_vector tsvector
);

-- Create the user installations table
create table user_installations (
    user_id uuid references auth.users not null,
    item_id uuid references marketplace_items not null,
    installed_at timestamp with time zone default now(),
    enabled boolean default true,
    settings jsonb default '{}'::jsonb,
    primary key (user_id, item_id)
);

-- Create the marketplace reviews table
create table marketplace_reviews (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users not null,
    item_id uuid references marketplace_items not null,
    rating integer check (rating between 1 and 5) not null,
    review text,
    created_at timestamp with time zone default now(),
    constraint unique_user_review unique (user_id, item_id)
);

-- Add indexes for better query performance
create index idx_marketplace_items_type on marketplace_items(type);
create index idx_marketplace_items_author on marketplace_items(author_id);
create index idx_marketplace_items_rating on marketplace_items(rating desc);
create index idx_marketplace_items_downloads on marketplace_items(downloads desc);

-- Add text search capabilities
create index idx_marketplace_items_search on marketplace_items using gin(search_vector);

-- Function to update search vector
create or replace function update_marketplace_search_vector()
returns trigger as $$
begin
    new.search_vector :=
        setweight(to_tsvector('english', coalesce(new.name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(new.description, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(array_to_string(new.tags, ' '), '')), 'C');
    return new;
end;
$$ language plpgsql;

-- Trigger to update search vector
create trigger update_marketplace_search_vector_trigger
    before insert or update
    on marketplace_items
    for each row
    execute function update_marketplace_search_vector();

-- Add RLS policies
alter table marketplace_items enable row level security;
alter table user_installations enable row level security;
alter table marketplace_reviews enable row level security;

-- Marketplace items policies
create policy "Anyone can view marketplace items"
    on marketplace_items for select
    using (true);

create policy "Authenticated users can create marketplace items"
    on marketplace_items for insert
    to authenticated
    with check (auth.uid() = author_id);

create policy "Authors can update their own items"
    on marketplace_items for update
    to authenticated
    using (auth.uid() = author_id)
    with check (auth.uid() = author_id);

-- User installations policies
create policy "Users can view their own installations"
    on user_installations for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can manage their own installations"
    on user_installations for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can update their own installations"
    on user_installations for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own installations"
    on user_installations for delete
    to authenticated
    using (auth.uid() = user_id);

-- Reviews policies
create policy "Anyone can view reviews"
    on marketplace_reviews for select
    using (true);

create policy "Authenticated users can create reviews"
    on marketplace_reviews for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can update their own reviews"
    on marketplace_reviews for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own reviews"
    on marketplace_reviews for delete
    to authenticated
    using (auth.uid() = user_id);

-- Functions for managing ratings
create or replace function update_marketplace_item_rating()
returns trigger as $$
begin
    update marketplace_items
    set rating = (
        select avg(rating)::float
        from marketplace_reviews
        where item_id = new.item_id
    ),
    review_count = (
        select count(*)
        from marketplace_reviews
        where item_id = new.item_id
    )
    where id = new.item_id;
    return new;
end;
$$ language plpgsql security definer;

-- Trigger to update ratings when reviews change
create trigger update_rating_on_review
    after insert or update or delete
    on marketplace_reviews
    for each row
    execute function update_marketplace_item_rating();

-- Function to increment download count
create or replace function increment_download_count()
returns trigger as $$
begin
    update marketplace_items
    set downloads = downloads + 1
    where id = new.item_id;
    return new;
end;
$$ language plpgsql security definer;

-- Trigger to increment downloads on installation
create trigger increment_downloads_on_install
    after insert
    on user_installations
    for each row
    execute function increment_download_count();
