export function url() {
  if (process.env.NODE_ENV === "production") {
    return "wss://renewing-subtly-glowworm.ngrok-free.app";
  } else {
    return "ws://localhost:3001";
  }
}
