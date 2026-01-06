-- Tabela de produtos para roteiros
CREATE TABLE public.script_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  niche text,
  promise text,
  price decimal(10,2),
  guarantee_days int DEFAULT 7,
  checkout_url text,
  whatsapp_url text,
  tone_tags text[] DEFAULT '{}',
  forbidden_words text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Tabela de blocos de roteiro
CREATE TABLE public.script_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.script_products(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('headline', 'body', 'offer', 'cta', 'ps')),
  text_content text NOT NULL,
  goal_tags text[] DEFAULT '{}',
  tone_tags text[] DEFAULT '{}',
  awareness_tags text[] DEFAULT '{}',
  est_seconds int DEFAULT 5,
  allow_price boolean DEFAULT false,
  is_active boolean DEFAULT true,
  usage_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Tabela de roteiros gerados pelos usuários
CREATE TABLE public.scripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid REFERENCES public.script_products(id) ON DELETE SET NULL,
  goal text NOT NULL,
  style text NOT NULL,
  duration_seconds int NOT NULL,
  headline_block_id uuid REFERENCES public.script_blocks(id) ON DELETE SET NULL,
  body_block_id uuid REFERENCES public.script_blocks(id) ON DELETE SET NULL,
  offer_block_id uuid REFERENCES public.script_blocks(id) ON DELETE SET NULL,
  cta_block_id uuid REFERENCES public.script_blocks(id) ON DELETE SET NULL,
  ps_block_id uuid REFERENCES public.script_blocks(id) ON DELETE SET NULL,
  final_text text NOT NULL,
  is_favorite boolean DEFAULT false,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'recorded')),
  created_at timestamptz DEFAULT now()
);

-- Tabela de eventos de uso (analytics)
CREATE TABLE public.script_usage_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  script_id uuid REFERENCES public.scripts(id) ON DELETE CASCADE,
  event_name text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.script_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.script_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.script_usage_events ENABLE ROW LEVEL SECURITY;

-- Políticas para script_products
CREATE POLICY "Admins can manage products" ON public.script_products
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view active products" ON public.script_products
  FOR SELECT USING (is_active = true);

-- Políticas para script_blocks
CREATE POLICY "Admins can manage blocks" ON public.script_blocks
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view active blocks" ON public.script_blocks
  FOR SELECT USING (is_active = true);

-- Políticas para scripts
CREATE POLICY "Users can view own scripts" ON public.scripts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scripts" ON public.scripts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scripts" ON public.scripts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scripts" ON public.scripts
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para script_usage_events
CREATE POLICY "Users can insert own events" ON public.script_usage_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own events" ON public.script_usage_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all events" ON public.script_usage_events
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));