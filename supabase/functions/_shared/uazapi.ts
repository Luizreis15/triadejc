const clean = (baseUrl: string) => baseUrl.replace(/\/+$/, "");

export async function sendText(baseUrl: string, token: string, phone: string, text: string): Promise<string | null> {
  const response = await fetch(`${clean(baseUrl)}/send/text`, {
    method: "POST",
    headers: { "Content-Type": "application/json", token },
    body: JSON.stringify({ number: phone, text, linkPreview: false, readchat: true, delay: 0 }),
  });
  const raw = await response.text();
  if (!response.ok) {
    throw new Error(`UAZAPI envio ${response.status}`);
  }
  try {
    const data = raw ? JSON.parse(raw) as Record<string, unknown> : {};
    const nested = data.message;
    const id = data.messageid ?? data.id ?? (nested && typeof nested === "object" ? (nested as Record<string, unknown>).messageid : null);
    return id ? String(id) : null;
  } catch {
    return null;
  }
}

export async function instanceConnected(baseUrl: string, token: string): Promise<boolean> {
  const response = await fetch(`${clean(baseUrl)}/status`, { headers: { token } });
  if (!response.ok) return false;
  const data = await response.json().catch(() => ({})) as Record<string, unknown>;
  const status = data.status;
  const checked = status && typeof status === "object"
    ? (status as Record<string, unknown>).checked_instance
    : null;
  const checkedStatus = checked && typeof checked === "object"
    ? (checked as Record<string, unknown>).connection_status
    : null;
  const instance = data.instance;
  const instanceStatus = instance && typeof instance === "object"
    ? (instance as Record<string, unknown>).status
    : null;
  return status === "CONNECTED"
    || data.state === "open"
    || data.connected === true
    || checkedStatus === "connected"
    || instanceStatus === "connected";
}
