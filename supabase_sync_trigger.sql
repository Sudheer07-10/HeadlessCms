-- Trigger to sync auth.users to public.users and create initial workspace

create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_user_id integer;
  new_tenant_id integer;
begin
  -- 1. Create User
  insert into public.users (supabase_uid, name, username, email, role, plan_tier, allowed_monthly_requests)
  values (
    new.id,
    new.raw_user_meta_data->>'name',
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
    'editor', -- Default role
    'FREE',
    20000
  ) returning id into new_user_id;

  -- 2. Create Workspace (Tenant) if provided in metadata
  if new.raw_user_meta_data->>'workspaceName' is not null and new.raw_user_meta_data->>'workspaceSlug' is not null then
    insert into public.tenants (name, slug)
    values (
      new.raw_user_meta_data->>'workspaceName',
      new.raw_user_meta_data->>'workspaceSlug'
    ) returning id into new_tenant_id;

    -- 3. Link User as Owner of Workspace
    insert into public.users_to_tenants (user_id, tenant_id, role)
    values (new_user_id, new_tenant_id, 'owner');

    -- 4. Seed Default English Locale
    insert into public.locales (tenant_id, code, name, is_default)
    values (new_tenant_id, 'en', 'English', true);

    -- 5. Seed Default "Read Access" Ability
    insert into public.abilities (tenant_id, name, is_system, permissions)
    values (new_tenant_id, 'Read Access', '1', '{}'::jsonb);
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Create the trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
