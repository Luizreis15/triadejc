/** Brazilian mobile as Uazapi expects it: country 55, no plus, no spaces. */
export function normalizeBrazilPhone(raw: string | null | undefined): string | null {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (!digits) return null;
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
  if (withCountry.length !== 12 && withCountry.length !== 13) return null;
  return withCountry;
}

export function maskPhone(phone: string): string {
  if (phone.length < 6) return "••••";
  return `${phone.slice(0, 4)}••••${phone.slice(-2)}`;
}
