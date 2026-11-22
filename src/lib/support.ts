/**
 * Canal de suporte da área de membros: (11) 2866-7666, informado pelo Luiz em 2026-11-22.
 * VITE_SUPPORT_WHATSAPP troca o número sem mexer no código (só dígitos, com 55 na frente).
 * Número inválido não vira link: a tela aponta para a página de contato do site.
 */
const DEFAULT_NUMBER = "551128667666";
const RAW = (import.meta.env.VITE_SUPPORT_WHATSAPP as string | undefined) || DEFAULT_NUMBER;
const DIGITS = RAW.replace(/\D/g, "");
const VALID = DIGITS.length >= 12 && !/^55?0+$/.test(DIGITS);

export const SUPPORT_MESSAGE = "Olá! Sou aluna da Jornada Única e preciso de ajuda com a área de membros.";

export const supportWhatsAppUrl: string | null = VALID
  ? `https://wa.me/${DIGITS}?text=${encodeURIComponent(SUPPORT_MESSAGE)}`
  : null;
