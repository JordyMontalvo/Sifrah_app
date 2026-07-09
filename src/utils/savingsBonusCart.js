export const BONUS_CART_STORAGE_KEY = "sifrah_bonus_cart";

export function cartStorageKey(session) {
  return `${BONUS_CART_STORAGE_KEY}_${session || "guest"}`;
}

export function loadBonusCart(session) {
  try {
    const raw = sessionStorage.getItem(cartStorageKey(session));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function saveBonusCart(session, cart) {
  try {
    sessionStorage.setItem(cartStorageKey(session), JSON.stringify(cart));
  } catch (e) {
    console.warn("No se pudo guardar el carrito de Bono Ahorro", e);
  }
}

export function clearBonusCart(session) {
  sessionStorage.removeItem(cartStorageKey(session));
}
