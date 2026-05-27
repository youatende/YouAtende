import { motion } from "motion/react";
import {
  Smartphone,
  Monitor,
  ScanLine,
  Lock
} from "lucide-react";

interface Props {
  qrCodeUrl: string;
  isDark: boolean;
  t: any;
}

export function WhatsappQrCard({
  qrCodeUrl,
  isDark,
}: Props) {
  const c = isDark
    ? {
        card:
          "linear-gradient(135deg, rgba(18,10,45,.92), rgba(54,26,105,.78))",
        border: "rgba(192,132,252,.28)",
        glow: "rgba(192,132,252,.18)",
        qrBorder: "rgba(192,132,252,.72)",
        qrBg: "rgba(255,255,255,.03)",
        text: "#fff",
        muted: "rgba(255,255,255,.72)",
        divider: "rgba(255,255,255,.10)",
        pillBg: "rgba(16,185,129,.12)",
        pillText: "#4ade80",
        pillBorder: "rgba(16,185,129,.18)",
        stepBg: "rgba(168,85,247,.14)",
      }
    : {
        card:
          "linear-gradient(135deg, rgba(255,255,255,.98), rgba(248,243,255,.96))",
        border: "rgba(192,132,252,.16)",
        glow: "rgba(192,132,252,.08)",
        qrBorder: "rgba(168,85,247,.34)",
        qrBg: "#fff",
        text: "#241b46",
        muted: "#6b7280",
        divider: "rgba(124,58,237,.08)",
        pillBg: "rgba(16,185,129,.08)",
        pillText: "#059669",
        pillBorder: "rgba(16,185,129,.14)",
        stepBg: "rgba(168,85,247,.08)",
      };

  return (
    <>
      <style>{`
        @keyframes cardGlow {
          0%,100% {
            box-shadow:
              0 12px 42px ${c.glow},
              inset 0 1px 0 rgba(255,255,255,.04);
          }
          50% {
            box-shadow:
              0 18px 56px rgba(192,132,252,.22),
              inset 0 1px 0 rgba(255,255,255,.06);
          }
        }

        @keyframes qrPulse {
          0%,100% {
            box-shadow: 0 0 18px rgba(192,132,252,.20);
          }
          50% {
            box-shadow: 0 0 34px rgba(192,132,252,.38);
          }
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .35 }}
        className="mt-5 w-full rounded-[34px] p-10"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center", // centraliza todo o bloco (QR + divisor + conteúdo)
          gap: 56,
          background: c.card,
          border: `1px solid ${c.border}`,
          backdropFilter: "blur(18px)",
          animation: "cardGlow 4s ease-in-out infinite",
        }}
      >
        {/* QR */}

        <div
          style={{
            width: 300,
            height: 300,
            borderRadius: 28,
            padding: 18,
            border: `2px solid ${c.qrBorder}`,
            background: c.qrBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "qrPulse 4s ease-in-out infinite",
            flexShrink: 0,
          }}
        >
          <img
            src={qrCodeUrl}
            alt="QR"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              borderRadius: 14,
              filter: isDark
                ? "invert(1) contrast(1.3)"
                : "none",
            }}
          />
        </div>

        {/* divider */}

        <div
          style={{
            width: 1,
            height: 380,
            background: c.divider,
            flexShrink: 0,
          }}
        />

        {/* CONTEÚDO – alinhado à esquerda, sem centralizar texto */}

        <div
          style={{
            flex: 1,
            maxWidth: 900,
            paddingLeft: 32,
          }}
        >
          <h2
            style={{
              fontSize: 28,
              fontWeight: 400, // grossura reduzida
              color: c.text,
              marginBottom: 28,
              letterSpacing: "-0.04em",
            }}
          >
            Conectar WhatsApp
          </h2>

          {[
            [Smartphone, "Abra o WhatsApp no seu celular"],
            [Monitor, "Toque em Aparelhos conectados"],
            [ScanLine, "Escaneie este QR Code ao lado"],
          ].map(([Icon, txt], i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                marginBottom: 18,
                color: c.muted,
                fontSize: 18,
                fontWeight: 400, // grossura reduzida
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 7,
                  background: c.stepBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={16} color="#a855f7" />
              </div>

              {txt}
            </div>
          ))}

          <div
            style={{
              display: "inline-flex",
              padding: "14px 24px",
              borderRadius: 999,
              background: c.pillBg,
              border: `1px solid ${c.pillBorder}`,
              color: c.pillText,
              fontWeight: 400, // grossura reduzida
              fontSize: 18,
              marginTop: 12,
              marginBottom: 28,
            }}
          >
            ● Aguardando leitura...
          </div>

          <div
            style={{
              borderTop: `1px solid ${c.divider}`,
              paddingTop: 18,
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: c.muted,
              fontSize: 16,
              fontWeight: 400, // grossura reduzida
            }}
          >
            <Lock size={16} />
            O código expira automaticamente por segurança.
          </div>
        </div>
      </motion.div>
    </>
  );
}