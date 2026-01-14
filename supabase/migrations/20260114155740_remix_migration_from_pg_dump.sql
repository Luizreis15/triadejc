CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'moderator',
    'user'
);


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: calendar_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calendar_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    scheduled_date date NOT NULL,
    title text,
    library_item_id uuid,
    status text DEFAULT 'empty'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT calendar_items_status_check CHECK ((status = ANY (ARRAY['empty'::text, 'planned'::text, 'posted'::text])))
);


--
-- Name: favorites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.favorites (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    library_item_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: leads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    source text DEFAULT 'manual'::text,
    status text DEFAULT 'novo'::text,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: library_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.library_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type text NOT NULL,
    stage text NOT NULL,
    format text NOT NULL,
    goal text NOT NULL,
    title text NOT NULL,
    content_md text NOT NULL,
    tags text[] DEFAULT '{}'::text[],
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT library_items_goal_check CHECK ((goal = ANY (ARRAY['grow'::text, 'authority'::text, 'sell'::text]))),
    CONSTRAINT library_items_stage_check CHECK ((stage = ANY (ARRAY['top'::text, 'middle'::text, 'bottom'::text]))),
    CONSTRAINT library_items_type_check CHECK ((type = ANY (ARRAY['model'::text, 'hook'::text, 'cta'::text])))
);


--
-- Name: module_cards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.module_cards (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    module_id uuid NOT NULL,
    order_index integer NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    content_md text,
    video_url text,
    cta_label text,
    cta_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT module_cards_type_check CHECK ((type = ANY (ARRAY['video'::text, 'text'::text, 'model'::text, 'exercise'::text, 'download'::text, 'summary'::text, 'tip'::text, 'map'::text])))
);


--
-- Name: modules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.modules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    description text,
    order_index integer NOT NULL,
    is_free boolean DEFAULT false,
    cover_image_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: notebook_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notebook_entries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    section text NOT NULL,
    title text,
    content_md text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT notebook_entries_section_check CHECK ((section = ANY (ARRAY['promise'::text, 'pillars'::text, 'audience'::text, 'drafts'::text, 'calendar'::text, 'results'::text, 'notes'::text])))
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    name text,
    email text,
    niche text,
    goal text,
    level text,
    onboarding_completed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT profiles_goal_check CHECK ((goal = ANY (ARRAY['grow'::text, 'authority'::text, 'sell'::text]))),
    CONSTRAINT profiles_level_check CHECK ((level = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text])))
);


--
-- Name: progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.progress (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    module_id uuid NOT NULL,
    completed boolean DEFAULT false,
    completed_at timestamp with time zone,
    last_seen_card_index integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.results (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    post_url text,
    post_date date NOT NULL,
    reach integer DEFAULT 0,
    saves integer DEFAULT 0,
    shares integer DEFAULT 0,
    dms integer DEFAULT 0,
    notes text,
    screenshot_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: script_blocks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.script_blocks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid,
    type text NOT NULL,
    text_content text NOT NULL,
    goal_tags text[] DEFAULT '{}'::text[],
    tone_tags text[] DEFAULT '{}'::text[],
    awareness_tags text[] DEFAULT '{}'::text[],
    est_seconds integer DEFAULT 5,
    allow_price boolean DEFAULT false,
    is_active boolean DEFAULT true,
    usage_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT script_blocks_type_check CHECK ((type = ANY (ARRAY['headline'::text, 'body'::text, 'offer'::text, 'cta'::text, 'ps'::text])))
);


--
-- Name: script_products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.script_products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    niche text,
    promise text,
    price numeric(10,2),
    guarantee_days integer DEFAULT 7,
    checkout_url text,
    whatsapp_url text,
    tone_tags text[] DEFAULT '{}'::text[],
    forbidden_words text[] DEFAULT '{}'::text[],
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: script_usage_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.script_usage_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    script_id uuid,
    event_name text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: scripts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.scripts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    product_id uuid,
    goal text NOT NULL,
    style text NOT NULL,
    duration_seconds integer NOT NULL,
    headline_block_id uuid,
    body_block_id uuid,
    offer_block_id uuid,
    cta_block_id uuid,
    ps_block_id uuid,
    final_text text NOT NULL,
    is_favorite boolean DEFAULT false,
    status text DEFAULT 'draft'::text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT scripts_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'recorded'::text])))
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: calendar_items calendar_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_items
    ADD CONSTRAINT calendar_items_pkey PRIMARY KEY (id);


--
-- Name: favorites favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_pkey PRIMARY KEY (id);


--
-- Name: favorites favorites_user_id_library_item_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_library_item_id_key UNIQUE (user_id, library_item_id);


--
-- Name: leads leads_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_email_key UNIQUE (email);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: library_items library_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.library_items
    ADD CONSTRAINT library_items_pkey PRIMARY KEY (id);


--
-- Name: module_cards module_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.module_cards
    ADD CONSTRAINT module_cards_pkey PRIMARY KEY (id);


--
-- Name: modules modules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (id);


--
-- Name: modules modules_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_slug_key UNIQUE (slug);


--
-- Name: notebook_entries notebook_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notebook_entries
    ADD CONSTRAINT notebook_entries_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: progress progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progress
    ADD CONSTRAINT progress_pkey PRIMARY KEY (id);


--
-- Name: progress progress_user_id_module_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progress
    ADD CONSTRAINT progress_user_id_module_id_key UNIQUE (user_id, module_id);


--
-- Name: results results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.results
    ADD CONSTRAINT results_pkey PRIMARY KEY (id);


--
-- Name: script_blocks script_blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.script_blocks
    ADD CONSTRAINT script_blocks_pkey PRIMARY KEY (id);


--
-- Name: script_products script_products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.script_products
    ADD CONSTRAINT script_products_pkey PRIMARY KEY (id);


--
-- Name: script_usage_events script_usage_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.script_usage_events
    ADD CONSTRAINT script_usage_events_pkey PRIMARY KEY (id);


--
-- Name: scripts scripts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scripts
    ADD CONSTRAINT scripts_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: calendar_items update_calendar_items_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_calendar_items_updated_at BEFORE UPDATE ON public.calendar_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: leads update_leads_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: notebook_entries update_notebook_entries_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_notebook_entries_updated_at BEFORE UPDATE ON public.notebook_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: progress update_progress_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_progress_updated_at BEFORE UPDATE ON public.progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: calendar_items calendar_items_library_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_items
    ADD CONSTRAINT calendar_items_library_item_id_fkey FOREIGN KEY (library_item_id) REFERENCES public.library_items(id) ON DELETE SET NULL;


--
-- Name: calendar_items calendar_items_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_items
    ADD CONSTRAINT calendar_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: favorites favorites_library_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_library_item_id_fkey FOREIGN KEY (library_item_id) REFERENCES public.library_items(id) ON DELETE CASCADE;


--
-- Name: favorites favorites_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: module_cards module_cards_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.module_cards
    ADD CONSTRAINT module_cards_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id) ON DELETE CASCADE;


--
-- Name: notebook_entries notebook_entries_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notebook_entries
    ADD CONSTRAINT notebook_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: progress progress_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progress
    ADD CONSTRAINT progress_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id) ON DELETE CASCADE;


--
-- Name: progress progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progress
    ADD CONSTRAINT progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: results results_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.results
    ADD CONSTRAINT results_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: script_blocks script_blocks_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.script_blocks
    ADD CONSTRAINT script_blocks_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.script_products(id) ON DELETE CASCADE;


--
-- Name: script_usage_events script_usage_events_script_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.script_usage_events
    ADD CONSTRAINT script_usage_events_script_id_fkey FOREIGN KEY (script_id) REFERENCES public.scripts(id) ON DELETE CASCADE;


--
-- Name: scripts scripts_body_block_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scripts
    ADD CONSTRAINT scripts_body_block_id_fkey FOREIGN KEY (body_block_id) REFERENCES public.script_blocks(id) ON DELETE SET NULL;


--
-- Name: scripts scripts_cta_block_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scripts
    ADD CONSTRAINT scripts_cta_block_id_fkey FOREIGN KEY (cta_block_id) REFERENCES public.script_blocks(id) ON DELETE SET NULL;


--
-- Name: scripts scripts_headline_block_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scripts
    ADD CONSTRAINT scripts_headline_block_id_fkey FOREIGN KEY (headline_block_id) REFERENCES public.script_blocks(id) ON DELETE SET NULL;


--
-- Name: scripts scripts_offer_block_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scripts
    ADD CONSTRAINT scripts_offer_block_id_fkey FOREIGN KEY (offer_block_id) REFERENCES public.script_blocks(id) ON DELETE SET NULL;


--
-- Name: scripts scripts_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scripts
    ADD CONSTRAINT scripts_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.script_products(id) ON DELETE SET NULL;


--
-- Name: scripts scripts_ps_block_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scripts
    ADD CONSTRAINT scripts_ps_block_id_fkey FOREIGN KEY (ps_block_id) REFERENCES public.script_blocks(id) ON DELETE SET NULL;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: leads Admins can delete leads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete leads" ON public.leads FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: library_items Admins can delete library items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete library items" ON public.library_items FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: module_cards Admins can delete module cards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete module cards" ON public.module_cards FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: modules Admins can delete modules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete modules" ON public.modules FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can delete roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: leads Admins can insert leads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert leads" ON public.leads FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: library_items Admins can insert library items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert library items" ON public.library_items FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: module_cards Admins can insert module cards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert module cards" ON public.module_cards FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: modules Admins can insert modules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert modules" ON public.modules FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can insert roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: script_blocks Admins can manage blocks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage blocks" ON public.script_blocks USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: script_products Admins can manage products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage products" ON public.script_products USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: leads Admins can update leads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update leads" ON public.leads FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: library_items Admins can update library items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update library items" ON public.library_items FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: module_cards Admins can update module cards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update module cards" ON public.module_cards FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: modules Admins can update modules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update modules" ON public.modules FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: script_usage_events Admins can view all events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all events" ON public.script_usage_events FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can view all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: leads Admins can view leads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view leads" ON public.leads FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: library_items Authenticated users can view library items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view library items" ON public.library_items FOR SELECT TO authenticated USING (true);


--
-- Name: module_cards Authenticated users can view module cards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view module cards" ON public.module_cards FOR SELECT TO authenticated USING (true);


--
-- Name: modules Authenticated users can view modules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view modules" ON public.modules FOR SELECT TO authenticated USING (true);


--
-- Name: calendar_items Users can delete own calendar items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own calendar items" ON public.calendar_items FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: favorites Users can delete own favorites; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own favorites" ON public.favorites FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: notebook_entries Users can delete own notebook entries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own notebook entries" ON public.notebook_entries FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: results Users can delete own results; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own results" ON public.results FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: scripts Users can delete own scripts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own scripts" ON public.scripts FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: calendar_items Users can insert own calendar items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own calendar items" ON public.calendar_items FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: script_usage_events Users can insert own events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own events" ON public.script_usage_events FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: favorites Users can insert own favorites; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own favorites" ON public.favorites FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: notebook_entries Users can insert own notebook entries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own notebook entries" ON public.notebook_entries FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: progress Users can insert own progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own progress" ON public.progress FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: results Users can insert own results; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own results" ON public.results FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: scripts Users can insert own scripts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own scripts" ON public.scripts FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: calendar_items Users can update own calendar items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own calendar items" ON public.calendar_items FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: notebook_entries Users can update own notebook entries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own notebook entries" ON public.notebook_entries FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: progress Users can update own progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own progress" ON public.progress FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: results Users can update own results; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own results" ON public.results FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: scripts Users can update own scripts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own scripts" ON public.scripts FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: script_blocks Users can view active blocks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view active blocks" ON public.script_blocks FOR SELECT USING ((is_active = true));


--
-- Name: script_products Users can view active products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view active products" ON public.script_products FOR SELECT USING ((is_active = true));


--
-- Name: calendar_items Users can view own calendar items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own calendar items" ON public.calendar_items FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: script_usage_events Users can view own events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own events" ON public.script_usage_events FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: favorites Users can view own favorites; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own favorites" ON public.favorites FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: notebook_entries Users can view own notebook entries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own notebook entries" ON public.notebook_entries FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: progress Users can view own progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own progress" ON public.progress FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: results Users can view own results; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own results" ON public.results FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_roles Users can view own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: scripts Users can view own scripts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own scripts" ON public.scripts FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: calendar_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.calendar_items ENABLE ROW LEVEL SECURITY;

--
-- Name: favorites; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

--
-- Name: leads; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

--
-- Name: library_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.library_items ENABLE ROW LEVEL SECURITY;

--
-- Name: module_cards; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.module_cards ENABLE ROW LEVEL SECURITY;

--
-- Name: modules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

--
-- Name: notebook_entries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notebook_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: progress; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

--
-- Name: results; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

--
-- Name: script_blocks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.script_blocks ENABLE ROW LEVEL SECURITY;

--
-- Name: script_products; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.script_products ENABLE ROW LEVEL SECURITY;

--
-- Name: script_usage_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.script_usage_events ENABLE ROW LEVEL SECURITY;

--
-- Name: scripts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.scripts ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;