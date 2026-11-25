begin;

-- Only a server-managed Auth role may use these two narrow operations.
-- Normal users cannot edit app_metadata. No backend SELECT policy is added.
create or replace function public.consume_request_budget(budget_key text, max_hits integer, window_secs integer)
returns boolean language plpgsql security definer set search_path = '' as $$
declare hit_count integer;
begin
 if auth.uid() is null or (auth.jwt()->'app_metadata'->>'role') is distinct from 'website_backend' then
  raise exception 'Forbidden' using errcode = '42501';
 end if;
 if budget_key is null or budget_key !~ '^[a-f0-9]{64}$' or max_hits is null or max_hits not between 1 and 10
    or window_secs is null or window_secs not between 1 and 900 then
  raise exception 'Invalid request budget' using errcode = '22023';
 end if;
 insert into public.request_budgets as b(key,hits,expires_at)
 values(budget_key,1,now()+pg_catalog.make_interval(secs=>window_secs))
 on conflict(key) do update set hits=case when b.expires_at<now() then 1 else least(b.hits+1,11) end,
 expires_at=case when b.expires_at<now() then now()+pg_catalog.make_interval(secs=>window_secs) else b.expires_at end
 returning hits into hit_count;
 delete from public.request_budgets where expires_at < now()-interval '1 day';
 return hit_count <= max_hits;
end $$;
revoke all on function public.consume_request_budget(text,integer,integer) from public, anon, authenticated, service_role;
grant execute on function public.consume_request_budget(text,integer,integer) to authenticated;

create function public.submit_website_enquiry(customer_name text, customer_mobile text, customer_pincode text, selected_services jsonb, amount integer)
returns uuid language plpgsql security definer set search_path = '' as $$
declare lead_id uuid;
begin
 if auth.uid() is null or (auth.jwt()->'app_metadata'->>'role') is distinct from 'website_backend' then
  raise exception 'Forbidden' using errcode = '42501';
 end if;
 if customer_name is null or char_length(customer_name) not between 2 and 100
    or customer_mobile is null or customer_mobile !~ '^[6-9][0-9]{9}$'
    or customer_pincode is null or customer_pincode !~ '^[1-9][0-9]{5}$'
    or selected_services is null or jsonb_typeof(selected_services) <> 'array'
    or octet_length(selected_services::text) > 8000 or amount is null or amount < 0 then
  raise exception 'Invalid enquiry' using errcode = '22023';
 end if;
 insert into public.leads(name,mobile,pincode,services,estimated_amount,source)
 values(customer_name,customer_mobile,customer_pincode,selected_services,amount,'website') returning id into lead_id;
 return lead_id;
end $$;
revoke all on function public.submit_website_enquiry(text,text,text,jsonb,integer) from public, anon, authenticated, service_role;
grant execute on function public.submit_website_enquiry(text,text,text,jsonb,integer) to authenticated;
commit;
