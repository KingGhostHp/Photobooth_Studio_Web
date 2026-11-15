const crypto = require("node:crypto");
const { assert } = require("./domain");
const sessions = new Map();
const attempts = new Map();
const COOKIE = "aura_session";
const ttl = 12 * 60 * 60 * 1000;
function safeEqual(a, b) {
  const x = crypto.createHash("sha256").update(String(a)).digest();
  const y = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
}
function admin(req) {
  const token = (req.headers.cookie || "")
    .split(";")
    .map((v) => v.trim())
    .find((v) => v.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1);
  const expires = sessions.get(token);
  if (!expires || expires < Date.now()) {
    if (token) sessions.delete(token);
    return false;
  }
  return true;
}
function requireAdmin(req, res, next) {
  if (!admin(req))
    return res
      .status(401)
      .json({ success: false, message: "Vui lòng đăng nhập quản trị." });
  req.isAdmin = true;
  next();
}
function sameOrigin(req, res, next) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const origin = req.headers.origin;
  const configured = (
    process.env.APP_ORIGIN ||
    (process.env.NODE_ENV === "production"
      ? ""
      : "http://127.0.0.1:5173,http://localhost:5173")
  )
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  try {
    if (
      origin &&
      new URL(origin).host !== req.headers.host &&
      !configured.includes(origin)
    )
      return res
        .status(403)
        .json({ success: false, message: "Nguồn yêu cầu không hợp lệ." });
  } catch {
    return res
      .status(403)
      .json({ success: false, message: "Nguồn yêu cầu không hợp lệ." });
  }
  if (req.headers["sec-fetch-site"] === "cross-site")
    return res
      .status(403)
      .json({ success: false, message: "Nguồn yêu cầu không hợp lệ." });
  next();
}
function registerAuth(app) {
  app.use("/api", sameOrigin);
  app.get("/api/auth/session", (req, res) => {
    res.set("Cache-Control", "no-store");
    res.json({
      success: true,
      authenticated: admin(req),
      configured: Boolean(process.env.ADMIN_PASSWORD),
    });
  });
  app.post("/api/auth/login", (req, res, next) => {
    try {
      assert(
        process.env.ADMIN_PASSWORD,
        "Chưa cấu hình ADMIN_PASSWORD cho server.",
        503,
      );
      const key = req.socket.remoteAddress;
      const previous = attempts.get(key);
      const entry =
        previous?.until > Date.now()
          ? previous
          : { count: 0, until: Date.now() + 15 * 60 * 1000 };
      assert(
        entry.count < 8,
        "Đã thử nhiều lần. Vui lòng thử lại sau 15 phút.",
        429,
      );
      entry.count++;
      attempts.set(key, entry);
      assert(
        safeEqual(
          req.body.username || "",
          process.env.ADMIN_USERNAME || "admin",
        ) && safeEqual(req.body.password || "", process.env.ADMIN_PASSWORD),
        "Tài khoản hoặc mật khẩu chưa đúng.",
        401,
      );
      attempts.delete(key);
      for (const [token, expiry] of sessions)
        if (expiry < Date.now()) sessions.delete(token);
      const token = crypto.randomBytes(32).toString("hex");
      sessions.set(token, Date.now() + ttl);
      res.cookie(COOKIE, token, {
        httpOnly: true,
        sameSite: "strict",
        secure: req.secure,
        maxAge: ttl,
        path: "/",
      });
      res.json({ success: true, authenticated: true });
    } catch (error) {
      next(error);
    }
  });
  app.post("/api/auth/logout", (req, res) => {
    const token = (req.headers.cookie || "")
      .split(";")
      .map((v) => v.trim())
      .find((v) => v.startsWith(`${COOKIE}=`))
      ?.slice(COOKIE.length + 1);
    sessions.delete(token);
    res.clearCookie(COOKIE, { path: "/" });
    res.json({ success: true });
  });
}
module.exports = { registerAuth, requireAdmin, admin, safeEqual };
