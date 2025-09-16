export const FRONTEND_URL =
  process.env.NODE_ENV === "production"
    ? "https://mobstermerch.store"
    : "http://localhost:5173";

console.log(`Frontend Url: ${FRONTEND_URL}\nProduction: ${process.env.NODE_ENV === "production"}`);

export const MERCHANT_REDIRECT_URL = "https://mobstermerch.store"
  // process.env.NODE_ENV === "production"
  //   ? "https://mobstermerch.store"
  //   : "https://unscarfed-laurel-floriferously.ngrok-free.app";