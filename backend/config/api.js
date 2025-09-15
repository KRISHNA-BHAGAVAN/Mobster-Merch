export const FRONTEND_URL =
  process.env.NODE_ENV === "production"
    ? "https://mobstermerch.store"
    : "http://localhost:5173";

export const MERCHANT_REDIRECT_URL =
  process.env.NODE_ENV === "production"
    ? "https://mobstermerch.store"
    : "https://unscarfed-laurel-floriferously.ngrok-free.app";