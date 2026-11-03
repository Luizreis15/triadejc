const LOGIN_URL = "https://www.jordanacantarelli.com.br/membros";

export interface WelcomeMessageData {
  name: string;
  email: string;
  link: string;
}

export function renderWelcomeMessage(template: string, data: WelcomeMessageData): string {
  const firstName = data.name.trim().split(/\s+/)[0] || "querida";
  return template
    .replaceAll("{nome}", firstName)
    .replaceAll("{email}", data.email.trim())
    .replaceAll("{link}", data.link.trim() || LOGIN_URL);
}

export function templateIsUsable(body: string): boolean {
  return body.includes("{email}") && body.includes("{link}") && body.trim().length >= 20 && body.length <= 1200;
}
