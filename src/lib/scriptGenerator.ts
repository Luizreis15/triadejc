import { supabase } from "@/integrations/supabase/client";

export type BlockType = 'headline' | 'body' | 'offer' | 'cta' | 'ps';
export type Goal = 'vender' | 'crescer' | 'dm' | 'engajar';
export type Style = 'direto' | 'storytelling' | 'verdade_dura' | 'didatico';

export interface ScriptBlock {
  id: string;
  product_id: string;
  type: BlockType;
  text_content: string;
  goal_tags: string[];
  tone_tags: string[];
  awareness_tags: string[];
  est_seconds: number;
  allow_price: boolean;
  is_active: boolean;
  usage_count: number;
}

export interface ScriptProduct {
  id: string;
  name: string;
  niche: string | null;
  promise: string | null;
  price: number | null;
  guarantee_days: number;
  checkout_url: string | null;
  whatsapp_url: string | null;
  tone_tags: string[];
  forbidden_words: string[];
  is_active: boolean;
}

export interface GenerateScriptOptions {
  productId: string;
  goal: Goal;
  durationSeconds: number;
  style: Style;
  lockedBlocks?: {
    headline?: string;
    body?: string;
    offer?: string;
    cta?: string;
    ps?: string;
  };
  excludeBlockIds?: string[];
}

export interface GeneratedScript {
  headline: ScriptBlock | null;
  body: ScriptBlock | null;
  offer: ScriptBlock | null;
  cta: ScriptBlock | null;
  ps: ScriptBlock | null;
  finalText: string;
  estimatedDuration: number;
  product: ScriptProduct;
}

// Conectores naturais para transições
const connectors = {
  headline_to_body: ['', 'E olha só:', 'Deixa eu te explicar:', 'A real é essa:'],
  body_to_offer: ['Por isso...', 'E é aqui que entra...', 'A solução?', 'Então...'],
  offer_to_cta: ['Agora...', 'E pra você começar...', 'Sua vez:', ''],
  cta_to_ps: ['Ah, e...', 'PS:', 'Lembrando:', ''],
};

function getRandomConnector(type: keyof typeof connectors): string {
  const options = connectors[type];
  return options[Math.floor(Math.random() * options.length)];
}

// Seleciona blocos baseado em regras
function selectBlock(
  blocks: ScriptBlock[],
  type: BlockType,
  goal: Goal,
  durationSeconds: number,
  lockedBlockId?: string,
  excludeIds: string[] = []
): ScriptBlock | null {
  // Se temos um bloco travado, retorna ele
  if (lockedBlockId) {
    return blocks.find(b => b.id === lockedBlockId) || null;
  }

  // Filtrar blocos do tipo correto e ativos
  let candidates = blocks.filter(b => 
    b.type === type && 
    b.is_active && 
    !excludeIds.includes(b.id)
  );

  if (candidates.length === 0) return null;

  // Priorizar blocos com tag do objetivo
  const goalTagMap: Record<Goal, string> = {
    vender: 'sell',
    crescer: 'grow',
    dm: 'dm',
    engajar: 'engage'
  };

  const goalTag = goalTagMap[goal];
  const withGoalTag = candidates.filter(b => 
    b.goal_tags.includes(goalTag) || b.goal_tags.includes(goal)
  );

  if (withGoalTag.length > 0) {
    candidates = withGoalTag;
  }

  // Para durações curtas, preferir blocos mais curtos
  if (durationSeconds <= 15) {
    const shortBlocks = candidates.filter(b => b.est_seconds <= 5);
    if (shortBlocks.length > 0) {
      candidates = shortBlocks;
    }
  } else if (durationSeconds <= 30) {
    const mediumBlocks = candidates.filter(b => b.est_seconds <= 10);
    if (mediumBlocks.length > 0) {
      candidates = mediumBlocks;
    }
  }

  // Ordenar por usage_count (menos usado primeiro) para variedade
  candidates.sort((a, b) => a.usage_count - b.usage_count);

  // Pegar um dos 3 menos usados aleatoriamente
  const topCandidates = candidates.slice(0, Math.min(3, candidates.length));
  return topCandidates[Math.floor(Math.random() * topCandidates.length)];
}

// Substitui placeholders no texto
function replacePlaceholders(text: string, product: ScriptProduct): string {
  return text
    .replace(/\{produto_nome\}/g, product.name)
    .replace(/\{preco\}/g, product.price ? `R$ ${product.price.toFixed(2).replace('.', ',')}` : '')
    .replace(/\{checkout_url\}/g, product.checkout_url || '')
    .replace(/\{whatsapp_url\}/g, product.whatsapp_url || '')
    .replace(/\{garantia\}/g, `${product.guarantee_days} dias`)
    .replace(/\{promessa\}/g, product.promise || '');
}

// Monta o texto final com conectores
function assembleScript(
  blocks: {
    headline: ScriptBlock | null;
    body: ScriptBlock | null;
    offer: ScriptBlock | null;
    cta: ScriptBlock | null;
    ps: ScriptBlock | null;
  },
  product: ScriptProduct
): string {
  const parts: string[] = [];

  if (blocks.headline) {
    parts.push(replacePlaceholders(blocks.headline.text_content, product));
  }

  if (blocks.body) {
    const connector = getRandomConnector('headline_to_body');
    const bodyText = replacePlaceholders(blocks.body.text_content, product);
    parts.push(connector ? `${connector}\n${bodyText}` : bodyText);
  }

  if (blocks.offer) {
    const connector = getRandomConnector('body_to_offer');
    const offerText = replacePlaceholders(blocks.offer.text_content, product);
    parts.push(connector ? `${connector}\n${offerText}` : offerText);
  }

  if (blocks.cta) {
    const connector = getRandomConnector('offer_to_cta');
    const ctaText = replacePlaceholders(blocks.cta.text_content, product);
    parts.push(connector ? `${connector}\n${ctaText}` : ctaText);
  }

  if (blocks.ps) {
    const connector = getRandomConnector('cta_to_ps');
    const psText = replacePlaceholders(blocks.ps.text_content, product);
    parts.push(connector ? `${connector}\n${psText}` : psText);
  }

  return parts.join('\n\n');
}

// Calcula duração estimada em segundos
function calculateDuration(blocks: {
  headline: ScriptBlock | null;
  body: ScriptBlock | null;
  offer: ScriptBlock | null;
  cta: ScriptBlock | null;
  ps: ScriptBlock | null;
}): number {
  let total = 0;
  if (blocks.headline) total += blocks.headline.est_seconds;
  if (blocks.body) total += blocks.body.est_seconds;
  if (blocks.offer) total += blocks.offer.est_seconds;
  if (blocks.cta) total += blocks.cta.est_seconds;
  if (blocks.ps) total += blocks.ps.est_seconds;
  return total;
}

export async function generateScript(options: GenerateScriptOptions): Promise<GeneratedScript> {
  const { productId, goal, durationSeconds, lockedBlocks = {}, excludeBlockIds = [] } = options;

  // Buscar produto
  const { data: product, error: productError } = await supabase
    .from('script_products')
    .select('*')
    .eq('id', productId)
    .single();

  if (productError || !product) {
    throw new Error('Produto não encontrado');
  }

  // Buscar blocos do produto
  const { data: blocks, error: blocksError } = await supabase
    .from('script_blocks')
    .select('*')
    .eq('product_id', productId)
    .eq('is_active', true);

  if (blocksError) {
    throw new Error('Erro ao buscar blocos');
  }

  const typedBlocks = (blocks || []) as ScriptBlock[];

  // Selecionar blocos para cada tipo
  const selectedBlocks = {
    headline: selectBlock(typedBlocks, 'headline', goal, durationSeconds, lockedBlocks.headline, excludeBlockIds),
    body: selectBlock(typedBlocks, 'body', goal, durationSeconds, lockedBlocks.body, excludeBlockIds),
    offer: selectBlock(typedBlocks, 'offer', goal, durationSeconds, lockedBlocks.offer, excludeBlockIds),
    cta: selectBlock(typedBlocks, 'cta', goal, durationSeconds, lockedBlocks.cta, excludeBlockIds),
    ps: durationSeconds >= 45 ? selectBlock(typedBlocks, 'ps', goal, durationSeconds, lockedBlocks.ps, excludeBlockIds) : null,
  };

  // Montar texto final
  const finalText = assembleScript(selectedBlocks, product as ScriptProduct);
  const estimatedDuration = calculateDuration(selectedBlocks);

  return {
    ...selectedBlocks,
    finalText,
    estimatedDuration,
    product: product as ScriptProduct,
  };
}

// Incrementa o contador de uso de um bloco
export async function incrementBlockUsage(blockId: string): Promise<void> {
  // Buscar valor atual e incrementar
  const { data } = await supabase
    .from('script_blocks')
    .select('usage_count')
    .eq('id', blockId)
    .single();
  
  await supabase
    .from('script_blocks')
    .update({ usage_count: (data?.usage_count || 0) + 1 })
    .eq('id', blockId);
}

// Registra evento de uso
export async function trackScriptEvent(
  userId: string,
  eventName: string,
  scriptId?: string,
  metadata?: Record<string, any>
): Promise<void> {
  await supabase.from('script_usage_events').insert({
    user_id: userId,
    script_id: scriptId || null,
    event_name: eventName,
    metadata: metadata || {},
  });
}
