const backendUrl = process.env.RENDER_BACKEND_URL?.trim();
const backend = backendUrl ? new URL(backendUrl) : null;

if (
  backend &&
  (backend.protocol !== "https:" || backend.href !== `${backend.origin}/`)
) {
  throw new Error("RENDER_BACKEND_URL must be an HTTPS origin without a path or credentials.");
}

export const config = {
  framework: "vite",
  buildCommand: "npm run build",
  outputDirectory: "dist",
  rewrites: backend
    ? [{ source: "/api/:path*", destination: `${backend.origin}/api/:path*` }]
    : [],
};
