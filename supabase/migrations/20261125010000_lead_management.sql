begin;
create table public.leads (
 id uuid primary key default gen_random_uuid(),
 name text not null check (char_length(name) between 2 and 100),
 mobile text not null check (mobile ~ '^[6-9][0-9]{9}$'),
 pincode text not null check (pincode ~ '^[1-9][0-9]{5}$'),
 services jsonb not null default '[]'::jsonb check (jsonb_typeof(services) = 'array'),
 estimated_amount integer not null default 0 check (estimated_amount >= 0),
 status text not null default 'new' check (status in ('new','contacted','scheduled','in_progress','completed','cancelled')),
 notes text not null default '', address text not null default '', assigned_to text not null default '',
 scheduled_at timestamptz, source text not null default 'website',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create index leads_created_at_idx on public.leads(created_at desc);
create index leads_status_idx on public.leads(status) where deleted_at is null;
create table public.lead_events (
 id bigint generated always as identity primary key,
 lead_id uuid not null references public.leads(id) on delete cascade,
 action text not null, actor_id uuid, created_at timestamptz not null default now()
);
create index lead_events_lead_idx on public.lead_events(lead_id,created_at desc);
create function public.is_baraabar_admin() returns boolean language sql stable security invoker set search_path = '' as $$
 select coalesce((auth.jwt()->'app_metadata'->>'role') = 'admin' and lower(auth.jwt()->>'email') = 'admin@baraabar.com', false)
$$;
alter table public.leads enable row level security;
alter table public.lead_events enable row level security;
revoke all on public.leads, public.lead_events from anon, authenticated;
grant select, insert, update, delete on public.leads to authenticated;
grant select on public.lead_events to authenticated;
grant all on public.leads, public.lead_events to service_role;
grant usage, select on sequence public.lead_events_id_seq to service_role;
create policy admin_leads on public.leads for all to authenticated using (public.is_baraabar_admin()) with check (public.is_baraabar_admin());
create policy admin_events on public.lead_events for select to authenticated using (public.is_baraabar_admin());
create function public.record_lead_change() returns trigger language plpgsql security definer set search_path = '' as $$
declare event_text text;
begin
 if TG_OP = 'INSERT' then event_text := 'Enquiry received';
 else
  new.updated_at := now();
  if old.deleted_at is null and new.deleted_at is not null then event_text := 'Moved to trash';
  elsif old.deleted_at is not null and new.deleted_at is null then event_text := 'Restored from trash';
  elsif new.status is distinct from old.status then event_text := 'Status changed to ' || new.status;
  else event_text := 'Lead details updated'; end if;
 end if;
 if TG_OP = 'UPDATE' then return new; end if;
 insert into public.lead_events(lead_id,action,actor_id) values(new.id,event_text,auth.uid());
 return new;
end $$;
create function public.record_lead_update() returns trigger language plpgsql security definer set search_path = '' as $$
declare event_text text;
begin
 if old.deleted_at is null and new.deleted_at is not null then event_text := 'Moved to trash';
 elsif old.deleted_at is not null and new.deleted_at is null then event_text := 'Restored from trash';
 elsif new.status is distinct from old.status then event_text := 'Status changed to ' || new.status;
 else event_text := 'Lead details updated'; end if;
 insert into public.lead_events(lead_id,action,actor_id) values(new.id,event_text,auth.uid());
 return new;
end $$;
create trigger lead_insert_event after insert on public.leads for each row execute function public.record_lead_change();
create trigger lead_update_timestamp before update on public.leads for each row execute function public.record_lead_change();
create trigger lead_update_event after update on public.leads for each row execute function public.record_lead_update();
create table public.request_budgets(key text primary key, hits integer not null, expires_at timestamptz not null);
alter table public.request_budgets enable row level security;
revoke all on public.request_budgets from anon, authenticated;
create function public.consume_request_budget(budget_key text, max_hits integer, window_secs integer) returns boolean language plpgsql security definer set search_path = '' as $$
declare hit_count integer;
begin
 insert into public.request_budgets as b(key,hits,expires_at) values(budget_key,1,now()+make_interval(secs=>window_secs))
 on conflict(key) do update set hits=case when b.expires_at<now() then 1 else b.hits+1 end,
 expires_at=case when b.expires_at<now() then now()+make_interval(secs=>window_secs) else b.expires_at end
 returning hits into hit_count;
 delete from public.request_budgets where expires_at < now()-interval '1 day';
 return hit_count <= max_hits;
end $$;
revoke all on function public.consume_request_budget(text,integer,integer) from public, anon, authenticated;
grant execute on function public.consume_request_budget(text,integer,integer) to service_role;
commit;
