-- Ejecutar UNA sola vez en Supabase SQL Editor.
create extension if not exists pgcrypto;
create table if not exists public.admin_users(user_id uuid primary key references auth.users(id) on delete cascade);
create table if not exists public.products(id uuid primary key default gen_random_uuid(), name text not null check(length(name) between 2 and 120), category text not null default 'General', description text not null default '', image_url text not null default '', price numeric(12,2) not null check(price>=0), stock integer not null default 0 check(stock>=0), active boolean not null default true, created_at timestamptz not null default now());
create table if not exists public.customer_profiles(user_id uuid primary key references auth.users(id) on delete cascade, full_name text not null, phone text not null, address text not null, created_at timestamptz not null default now());
create table if not exists public.orders(id uuid primary key default gen_random_uuid(), customer_id uuid not null references auth.users(id), amount numeric(12,2) not null check(amount>=0), payment_method text not null check(payment_method in ('yape','plin','transferencia')), payment_status text not null default 'pendiente' check(payment_status in ('pendiente','verificado','rechazado')), order_status text not null default 'recibido' check(order_status in ('recibido','preparando','enviado','entregado','cancelado')), created_at timestamptz not null default now());
create table if not exists public.order_items(id bigint generated always as identity primary key, order_id uuid not null references public.orders(id) on delete cascade, product_id uuid not null references public.products(id), name text not null, quantity integer not null check(quantity>0), unit_price numeric(12,2) not null check(unit_price>=0));
create index if not exists products_active_idx on public.products(active);
create index if not exists orders_customer_idx on public.orders(customer_id);
create index if not exists items_order_idx on public.order_items(order_id);
alter table public.admin_users enable row level security;
alter table public.products enable row level security;
alter table public.customer_profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
revoke all on public.admin_users,public.products,public.customer_profiles,public.orders,public.order_items from anon,authenticated;
grant select on public.admin_users to authenticated;
grant select on public.products to anon,authenticated;
grant insert,update,delete on public.products to authenticated;
grant select,insert,update on public.customer_profiles to authenticated;
grant select on public.orders,public.order_items to authenticated;
grant update(payment_status,order_status) on public.orders to authenticated;
create policy "admin self" on public.admin_users for select to authenticated using(user_id=(select auth.uid()));
create policy "public active products" on public.products for select to anon,authenticated using(active or exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())));
create policy "admin create product" on public.products for insert to authenticated with check(exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())));
create policy "admin update product" on public.products for update to authenticated using(exists(select 1 from public.admin_users a where a.user_id=(select auth.uid()))) with check(exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())));
create policy "admin delete product" on public.products for delete to authenticated using(exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())));
create policy "own profile read" on public.customer_profiles for select to authenticated using(user_id=(select auth.uid()) or exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())));
create policy "own profile insert" on public.customer_profiles for insert to authenticated with check(user_id=(select auth.uid()));
create policy "own profile update" on public.customer_profiles for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy "own orders" on public.orders for select to authenticated using(customer_id=(select auth.uid()) or exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())));
create policy "admin order status" on public.orders for update to authenticated using(exists(select 1 from public.admin_users a where a.user_id=(select auth.uid()))) with check(exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())));
create policy "own order items" on public.order_items for select to authenticated using(exists(select 1 from public.orders o where o.id=order_id and (o.customer_id=(select auth.uid()) or exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())))));
-- Crear pedido en transacción: precio e inventario siempre controlados por servidor.
create or replace function public.place_order(p_items jsonb,p_method text) returns uuid language plpgsql security definer set search_path='' as $$
declare uid uuid := auth.uid(); rid uuid; rec record; total numeric(12,2):=0; n integer:=0;
begin
 if uid is null then raise exception 'Debes iniciar sesión'; end if;
 if not exists(select 1 from public.customer_profiles where user_id=uid and length(trim(full_name))>1 and length(trim(phone))>=6 and length(trim(address))>=5) then raise exception 'Completa tu perfil de cliente'; end if;
 if p_method not in ('yape','plin','transferencia') then raise exception 'Medio de pago inválido'; end if;
 if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)=0 or jsonb_array_length(p_items)>30 then raise exception 'Carrito inválido'; end if;
 if exists(select 1 from jsonb_array_elements(p_items) j where jsonb_typeof(j)<>'object' or (j->>'id') is null or (j->>'quantity') !~ '^[1-9][0-9]{0,2}$') then raise exception 'Producto o cantidad inválida'; end if;
 if (select count(*) from jsonb_array_elements(p_items))<>(select count(distinct j->>'id') from jsonb_array_elements(p_items) j) then raise exception 'Productos duplicados'; end if;
 -- Lock ordenado previene carreras y disminuye deadlocks.
 for rec in select p.id,p.name,p.price,p.stock,(j->>'quantity')::integer qty from jsonb_array_elements(p_items) j join public.products p on p.id::text=j->>'id' where p.active order by p.id for update of p loop
   if rec.stock<rec.qty then raise exception 'Stock insuficiente para %',rec.name; end if;
   total:=total+rec.price*rec.qty;n:=n+1;
 end loop;
 if n<>jsonb_array_length(p_items) then raise exception 'Hay productos no disponibles'; end if;
 insert into public.orders(customer_id,amount,payment_method) values(uid,total,p_method) returning id into rid;
 for rec in select p.id,p.name,p.price,(j->>'quantity')::integer qty from jsonb_array_elements(p_items) j join public.products p on p.id::text=j->>'id' loop
   update public.products set stock=stock-rec.qty where id=rec.id;
   insert into public.order_items(order_id,product_id,name,quantity,unit_price) values(rid,rec.id,rec.name,rec.qty,rec.price);
 end loop;
 return rid;
end $$;
revoke all on function public.place_order(jsonb,text) from public,anon;
grant execute on function public.place_order(jsonb,text) to authenticated;
-- IMPORTANTE: en SQL Editor, sustituir el correo por el correo REAL del administrador.
-- Hacerlo DESPUÉS de registrar la cuenta y confirmar su email:
-- insert into public.admin_users(user_id)
-- select id from auth.users where email='TU_CORREO_REAL@DOMINIO.COM'
-- on conflict do nothing;
