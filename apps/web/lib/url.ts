export function url() {
    if (process.env.NODE_ENV === "production") {
        return "renewing-subtly-glowworm.ngrok-free.app";
    } else {
        return "localhost:3001";
    }
}