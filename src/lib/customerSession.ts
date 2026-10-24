export type CustomerSession = {
  id: string;
  email: string;
  name: string;
  token: string;
};

const KEY = "empulse_customer";

export function saveCustomerSession(session: CustomerSession) {
  localStorage.setItem(KEY, JSON.stringify(session));
  window.dispatchEvent(new Event("empulse-customer"));
}

export function readCustomerSession(): CustomerSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CustomerSession;
    if (!parsed?.token || !parsed.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearCustomerSession() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("empulse-customer"));
}
