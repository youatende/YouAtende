import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Eye, EyeOff, Mail, Lock, LogIn, AlertCircle, Sun, Moon,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import logoImg from "../../../assets/7dee4d2422fa054a783195ac473a80d49248e146.png";

export function Login() {
  const navigate    = useNavigate();
  const { login, user } = useAuth();
  const { mode, toggle } = useTheme();
  const isDark = mode === "dark";

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  /* If already logged in, skip login */
  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Preencha e-mail e senha."); return; }
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message;
      if (msg?.toLowerCase().includes("credentials") || msg?.toLowerCase().includes("senha") || err?.response?.status === 401) {
        setError("E-mail ou senha incorretos.");
      } else if (err?.code === "ECONNABORTED" || err?.code === "ERR_NETWORK" || !err?.response) {
        setError("Não foi possível conectar ao servidor. Verifique a URL e tente novamente.");
      } else {
        setError(msg || "Erro ao fazer login. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* Styling helpers */
  const bg     = isDark
    ? "linear-gradient(135deg, #0d0221 0%, #1a0845 20%, #2d0e6e 40%, #4a1496 60%, #6b21c0 80%, #8b2fc9 100%)"
    : "#f5f6f8";

  const cardBg = isDark
    ? "rgba(255,255,255,0.07)"
    : "#ffffff";
  const cardBorder = isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid #e5e7eb";
  const cardShadow = isDark
    ? "0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(124,58,237,0.18)"
    : "0 20px 60px rgba(0,0,0,0.10)";

  const inputBg     = isDark ? "rgba(0,0,0,0.22)" : "#f3f4f6";
  const inputBorder = isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb";
  const inputColor  = isDark ? "#ffffff" : "#111827";
  const labelColor  = isDark ? "rgba(255,255,255,0.55)" : "#6b7280";
  const textPrimary = isDark ? "#ffffff" : "#111827";
  const textSecondary = isDark ? "rgba(255,255,255,0.55)" : "#6b7280";

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: bg, position: "relative", overflow: "hidden" }}
    >
      {/* Background blobs (dark only) */}
      {isDark && (
        <>
          <div style={{ position: "absolute", top: "5%",  left: "10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)", filter: "blur(80px)", animation: "blobF1 8s ease-in-out infinite" }} />
          <div style={{ position: "absolute", top: "50%", right: "5%", width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.25) 0%, transparent 70%)", filter: "blur(100px)", animation: "blobF2 10s ease-in-out infinite" }} />
          <div style={{ position: "absolute", bottom: "5%", left: "30%", width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(219,39,119,0.18) 0%, transparent 70%)", filter: "blur(90px)", animation: "blobF3 12s ease-in-out infinite" }} />
        </>
      )}

      <style>{`
        @keyframes blobF1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-20px) scale(1.05)} 66%{transform:translate(-20px,15px) scale(0.95)} }
        @keyframes blobF2 { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(-25px,30px) scale(1.08)} 70%{transform:translate(20px,-15px) scale(0.92)} }
        @keyframes blobF3 { 0%,100%{transform:translate(0,0) scale(1)} 30%{transform:translate(20px,25px) scale(1.03)} 60%{transform:translate(-30px,-10px) scale(0.97)} }
      `}</style>

      {/* Theme toggle */}
      <button
        onClick={toggle}
        title={isDark ? "Modo claro" : "Modo escuro"}
        className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{ background: isDark ? "rgba(255,255,255,0.08)" : "#f3f4f6", border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid #e5e7eb", color: isDark ? "rgba(255,255,255,0.7)" : "#374151", zIndex: 10 }}
      >
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.span key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }} style={{ display: "flex" }}>
              <Sun size={16} />
            </motion.span>
          ) : (
            <motion.span key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }} style={{ display: "flex" }}>
              <Moon size={16} />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
        style={{
          background: cardBg,
          backdropFilter: isDark ? "blur(24px)" : "none",
          WebkitBackdropFilter: isDark ? "blur(24px)" : "none",
          border: cardBorder,
          borderRadius: 24,
          boxShadow: cardShadow,
          padding: 36,
        }}
      >
        {/* Accent line */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent 10%, rgba(124,58,237,0.6) 40%, rgba(236,72,153,0.5) 65%, transparent 90%)", borderRadius: "24px 24px 0 0" }} />

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logoImg} alt="YouAtende" style={{ height: 52, width: "auto", objectFit: "contain" }} />
        </div>

        <div className="mb-6 text-center">
          <h2 style={{ fontSize: 22, fontWeight: 800, color: textPrimary, marginBottom: 4 }}>
            Faça seu login
          </h2>
          <p style={{ fontSize: 13, color: textSecondary, lineHeight: 1.6 }}>
            Acesse sua conta para continuar
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label style={{ fontSize: 12, color: labelColor, fontWeight: 500, marginBottom: 6, display: "block" }}>E-mail</label>
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: inputBg, border: inputBorder }}>
              <Mail size={15} style={{ color: "rgba(124,58,237,0.6)", flexShrink: 0 }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="flex-1 bg-transparent outline-none"
                style={{ fontSize: 13, color: inputColor }}
                autoFocus
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: labelColor, fontWeight: 500, marginBottom: 6, display: "block" }}>Senha</label>
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: inputBg, border: inputBorder }}>
              <Lock size={15} style={{ color: "rgba(124,58,237,0.6)", flexShrink: 0 }} />
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="flex-1 bg-transparent outline-none"
                style={{ fontSize: 13, color: inputColor }}
              />
              <button type="button" onClick={() => setShowPass((v) => !v)} style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#9ca3af", background: "none", border: "none", cursor: "pointer", display: "flex" }}>
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: isDark ? "rgba(239,68,68,0.12)" : "#fef2f2", border: isDark ? "1px solid rgba(239,68,68,0.25)" : "1px solid #fecaca" }}>
                <AlertCircle size={14} style={{ color: "#ef4444", flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "#ef4444" }}>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #ec4899, #7c3aed)", border: "none", fontSize: 14, fontWeight: 700, color: "white", boxShadow: "0 4px 20px rgba(124,58,237,0.4)", opacity: loading ? 0.75 : 1 }}
          >
            {loading ? (
              <svg width="18" height="18" viewBox="0 0 24 24" style={{ animation: "spin 1s linear infinite" }}>
                <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" fill="none" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>
            ) : (
              <LogIn size={15} />
            )}
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center mt-6" style={{ fontSize: 11, color: isDark ? "rgba(255,255,255,0.25)" : "#9ca3af" }}>
          YouAtende · Feito com ❤️ no Brasil
        </p>
      </motion.div>
    </div>
  );
}
