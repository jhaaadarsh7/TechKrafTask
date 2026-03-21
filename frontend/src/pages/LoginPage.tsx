

import { useMemo, useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type Mode = "login" | "register";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [shake, setShake] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successField, setSuccessField] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const heading = useMemo(
    () => (mode === "login" ? "Welcome back" : "Create account"),
    [mode]
  );

  const handleModeSwitch = (next: Mode) => {
    if (next === mode) return;
    setError(null);
    setMode(next);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      setError(msg);
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Outfit:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --ink:      #0f0e0c;
          --ink-2:    #2a2520;
          --ink-3:    #5a534c;
          --ink-4:    #9e968e;
          --gold:     #b8965a;
          --gold-lt:  #d4b07a;
          --gold-dim: rgba(184,150,90,0.14);
          --cream:    #f8f4ee;
          --cream-2:  #f1ebe2;
          --white:    #ffffff;
          --border:   rgba(184,150,90,0.22);
          --border-2: rgba(15,14,12,0.08);
          --err:      #c0392b;
          --err-bg:   #fff8f8;
          --err-bd:   rgba(192,57,43,0.25);
          --radius:   10px;
        }

        .lp-root {
          min-height: 100svh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: 'Outfit', sans-serif;
          background: var(--cream);
          overflow: hidden;
        }

        /* ─── Left panel ─── */
        .lp-panel {
          position: relative;
          background: var(--ink);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 3rem 3.5rem;
          overflow: hidden;
        }

        /* Subtle ambient light */
        .lp-panel::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 55% at 15% 105%, rgba(184,150,90,0.28) 0%, transparent 65%),
            radial-gradient(ellipse 55% 45% at 92% -5%, rgba(184,150,90,0.12) 0%, transparent 60%);
          pointer-events: none;
          z-index: 0;
        }

        /* Subtle geometric pattern overlay */
        .lp-panel-pattern {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          opacity: 0.035;
          background-image: repeating-linear-gradient(
            45deg,
            #b8965a 0, #b8965a 1px,
            transparent 0, transparent 50%
          );
          background-size: 28px 28px;
        }

        /* Thin gold accent line on right edge */
        .lp-panel::after {
          content: '';
          position: absolute;
          top: 12%;
          right: 0;
          bottom: 12%;
          width: 1px;
          background: linear-gradient(to bottom, transparent, rgba(184,150,90,0.5) 40%, rgba(184,150,90,0.5) 60%, transparent);
        }

        /* Brand */
        .lp-brand {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          opacity: 0;
          transform: translateY(14px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .lp-brand.visible { opacity: 1; transform: translateY(0); }

        .lp-brand-monogram {
          width: 40px;
          height: 40px;
          border: 1px solid rgba(184,150,90,0.45);
          border-radius: 8px;
          display: grid;
          place-items: center;
          background: rgba(184,150,90,0.08);
          position: relative;
        }
        .lp-brand-monogram::after {
          content: '';
          position: absolute;
          inset: 3px;
          border: 1px solid rgba(184,150,90,0.2);
          border-radius: 5px;
        }

        .lp-brand-name {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .lp-brand-title {
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(248,244,238,0.75);
          line-height: 1;
        }
        .lp-brand-sub {
          font-size: 0.6rem;
          letter-spacing: 0.1em;
          color: rgba(184,150,90,0.7);
          text-transform: uppercase;
          line-height: 1;
        }

        /* Hero copy */
        .lp-panel-copy {
          position: relative;
          z-index: 1;
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.9s ease 0.2s, transform 0.9s ease 0.2s;
        }
        .lp-panel-copy.visible { opacity: 1; transform: translateY(0); }

        /* Thin gold rule above headline */
        .lp-rule {
          width: 36px;
          height: 1px;
          background: var(--gold);
          margin-bottom: 1.5rem;
          opacity: 0.7;
        }

        .lp-headline {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.8rem, 4vw, 3.8rem);
          font-weight: 400;
          line-height: 1.08;
          color: var(--cream);
          letter-spacing: -0.01em;
        }
        .lp-headline em {
          font-style: italic;
          color: var(--gold-lt);
        }
        .lp-headline .lp-hl-light {
          display: block;
          font-weight: 300;
          opacity: 0.55;
          font-size: 0.78em;
          letter-spacing: 0.02em;
          font-family: 'Outfit', sans-serif;
          text-transform: uppercase;
          font-style: normal;
          color: var(--gold-lt);
          margin-bottom: 0.4rem;
        }

        .lp-panel-desc {
          margin-top: 1.4rem;
          font-size: 0.84rem;
          font-weight: 300;
          line-height: 1.8;
          color: rgba(248,244,238,0.42);
          max-width: 28ch;
        }

        /* Stats row */
        .lp-stats {
          position: relative;
          z-index: 1;
          display: flex;
          gap: 0;
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.9s ease 0.36s, transform 0.9s ease 0.36s;
        }
        .lp-stats.visible { opacity: 1; transform: translateY(0); }

        .lp-stat {
          flex: 1;
          padding: 1rem 0;
          border-top: 1px solid rgba(184,150,90,0.2);
        }
        .lp-stat + .lp-stat {
          margin-left: 1.5rem;
          padding-left: 1.5rem;
          border-left: 1px solid rgba(184,150,90,0.12);
        }
        .lp-stat-n {
          font-family: 'Playfair Display', serif;
          font-size: 1.65rem;
          font-weight: 500;
          color: var(--gold-lt);
          line-height: 1;
          letter-spacing: -0.02em;
        }
        .lp-stat-l {
          margin-top: 0.3rem;
          font-size: 0.62rem;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(248,244,238,0.28);
        }

        /* Large decorative building silhouette */
        .lp-silhouette {
          position: absolute;
          bottom: 0;
          right: -8px;
          width: 52%;
          opacity: 0.055;
          pointer-events: none;
          z-index: 0;
        }

        /* ─── Right form panel ─── */
        .lp-form-wrap {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 3.5rem 4.5rem 3.5rem 4rem;
          position: relative;
          opacity: 0;
          transform: translateX(22px);
          transition: opacity 0.75s ease 0.12s, transform 0.75s ease 0.12s;
        }
        .lp-form-wrap.visible { opacity: 1; transform: translateX(0); }

        /* Tiny eyebrow label */
        .lp-eyebrow {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          margin-bottom: 0.9rem;
        }
        .lp-eyebrow-line {
          width: 20px;
          height: 1px;
          background: var(--gold);
          opacity: 0.7;
        }
        .lp-eyebrow-text {
          font-size: 0.62rem;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--gold);
        }

        .lp-heading {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.2rem, 3.4vw, 3rem);
          font-weight: 400;
          line-height: 1.05;
          color: var(--ink);
          letter-spacing: -0.01em;
        }
        .lp-sub-text {
          margin-top: 0.65rem;
          font-size: 0.82rem;
          font-weight: 300;
          line-height: 1.75;
          color: var(--ink-3);
          max-width: 34ch;
        }

        /* Mode tabs — understated, gold underline style */
        .lp-tabs {
          display: flex;
          margin-top: 2rem;
          gap: 0;
          position: relative;
        }
        .lp-tabs::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: var(--cream-2);
        }
        .lp-tab {
          padding: 0.5rem 1.6rem 0.65rem;
          font-family: 'Outfit', sans-serif;
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--ink-4);
          background: none;
          border: none;
          border-bottom: 1.5px solid transparent;
          margin-bottom: -1px;
          cursor: pointer;
          position: relative;
          z-index: 1;
          transition: color 0.2s, border-color 0.2s;
        }
        .lp-tab:first-child { padding-left: 0; }
        .lp-tab:hover { color: var(--ink-2); }
        .lp-tab.active { color: var(--ink); border-bottom-color: var(--gold); }

        /* Form fields */
        .lp-form {
          margin-top: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .lp-field {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.4s ease, transform 0.4s ease;
        }
        .lp-field.visible { opacity: 1; transform: translateY(0); }

        .lp-label {
          font-size: 0.67rem;
          font-weight: 600;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          color: var(--ink-3);
        }

        .lp-input-wrap { position: relative; }

        .lp-input {
          width: 100%;
          padding: 0.75rem 1rem;
          font-family: 'Outfit', sans-serif;
          font-size: 0.88rem;
          font-weight: 400;
          color: var(--ink);
          background: var(--white);
          border: 1px solid var(--border-2);
          border-radius: var(--radius);
          outline: none;
          transition: border-color 0.25s, box-shadow 0.25s;
          -webkit-appearance: none;
        }
        .lp-input::placeholder { color: #ccc6be; }
        .lp-input:hover { border-color: rgba(184,150,90,0.35); }
        .lp-input:focus {
          border-color: var(--gold);
          box-shadow: 0 0 0 3px rgba(184,150,90,0.1), 0 1px 4px rgba(15,14,12,0.05);
        }
        .lp-input.has-icon { padding-right: 2.75rem; }

        /* Password toggle */
        .lp-eye-btn {
          position: absolute;
          right: 0.8rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--ink-4);
          padding: 2px;
          display: grid;
          place-items: center;
          transition: color 0.15s;
        }
        .lp-eye-btn:hover { color: var(--ink); }

        /* Error banner */
        .lp-error {
          display: flex;
          align-items: flex-start;
          gap: 0.6rem;
          background: var(--err-bg);
          border: 1px solid var(--err-bd);
          border-left: 2px solid var(--err);
          border-radius: var(--radius);
          padding: 0.75rem 1rem;
          animation: errIn 0.3s cubic-bezier(0.34,1.4,0.64,1) both;
        }
        @keyframes errIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: none; }
        }
        .lp-error-icon {
          flex-shrink: 0;
          width: 15px; height: 15px;
          margin-top: 1px;
          color: var(--err);
        }
        .lp-error-text {
          font-size: 0.79rem;
          font-weight: 500;
          color: var(--err);
          line-height: 1.5;
        }

        /* Shake */
        .lp-form-card.shake {
          animation: shk 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shk {
          10%,90% { transform: translateX(-2px); }
          20%,80% { transform: translateX(4px); }
          30%,50%,70% { transform: translateX(-5px); }
          40%,60% { transform: translateX(5px); }
        }

        /* Submit */
        .lp-submit {
          margin-top: 0.25rem;
          padding: 0.85rem 1.5rem;
          font-family: 'Outfit', sans-serif;
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--cream);
          background: var(--ink);
          border: none;
          border-radius: var(--radius);
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: background 0.25s, transform 0.15s, box-shadow 0.25s;
        }

        /* Shimmer on hover */
        .lp-submit::before {
          content: '';
          position: absolute;
          top: 0; left: -100%; bottom: 0;
          width: 60%;
          background: linear-gradient(90deg, transparent, rgba(184,150,90,0.18), transparent);
          transition: left 0.45s ease;
        }
        .lp-submit:hover:not(:disabled)::before { left: 150%; }
        .lp-submit:hover:not(:disabled) {
          background: var(--ink-2);
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(15,14,12,0.18), 0 2px 6px rgba(15,14,12,0.1);
        }
        .lp-submit:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: none;
        }
        .lp-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Loading dots */
        .lp-dots span {
          display: inline-block;
          width: 4px; height: 4px;
          background: currentColor;
          border-radius: 50%;
          margin: 0 2px;
          animation: dt 1.2s infinite ease-in-out;
        }
        .lp-dots span:nth-child(2) { animation-delay: 0.2s; }
        .lp-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes dt {
          0%,80%,100% { transform: scale(0.5); opacity: 0.35; }
          40% { transform: scale(1); opacity: 1; }
        }

        /* Footer note */
        .lp-footer {
          margin-top: 1.75rem;
          padding-top: 1.25rem;
          border-top: 1px solid var(--cream-2);
          font-size: 0.7rem;
          font-weight: 300;
          color: var(--ink-4);
          line-height: 1.65;
        }
        .lp-footer a {
          color: var(--gold);
          text-decoration: none;
          border-bottom: 1px solid rgba(184,150,90,0.3);
          transition: border-color 0.2s;
        }
        .lp-footer a:hover { border-color: var(--gold); }

        /* Trust badges */
        .lp-trust {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 1.25rem;
        }
        .lp-trust-item {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.65rem;
          font-weight: 500;
          letter-spacing: 0.06em;
          color: var(--ink-4);
        }
        .lp-trust-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: var(--gold);
          opacity: 0.6;
          flex-shrink: 0;
        }

        /* ─── Mobile ─── */
        @media (max-width: 820px) {
          .lp-root {
            grid-template-columns: 1fr;
          }
          .lp-panel {
            padding: 1.75rem 2rem;
            flex-direction: row;
            align-items: center;
            gap: 1rem;
            min-height: auto;
          }
          .lp-panel-copy, .lp-stats, .lp-silhouette { display: none; }
          .lp-form-wrap {
            padding: 2.5rem 2rem 3rem;
            opacity: 1 !important;
            transform: none !important;
          }
          .lp-brand { opacity: 1 !important; transform: none !important; }
        }

        @media (max-width: 480px) {
          .lp-form-wrap { padding: 2rem 1.25rem 2.5rem; }
          .lp-heading { font-size: 2.2rem; }
        }
      `}</style>

      <div className="lp-root">

        <aside className="lp-panel">
          <div className="lp-panel-pattern" />

          <svg className="lp-silhouette" viewBox="0 0 220 320" fill="white" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="90" width="48" height="230" />
            <rect x="18" y="64" width="32" height="28" />
            <rect x="23" y="38" width="22" height="28" />
            <rect x="68" y="120" width="36" height="200" />
            <rect x="75" y="98" width="22" height="24" />
            <rect x="115" y="68" width="60" height="252" />
            <rect x="122" y="38" width="46" height="32" />
            <rect x="128" y="12" width="34" height="28" />
            <rect x="182" y="145" width="30" height="175" />
            <rect x="186" y="120" width="22" height="27" />
            {[100,122,144,166,188,210,232,256].map(y =>
              [20,30,40].map(x =>
                <rect key={`a${x}-${y}`} x={x} y={y} width="7" height="10" opacity="0.45" />
              )
            )}
            {[80,102,124,148,172,196,220,246,268].map(y =>
              [122,134,148,160].map(x =>
                <rect key={`b${x}-${y}`} x={x} y={y} width="8" height="12" opacity="0.45" />
              )
            )}
          </svg>

          <div className={`lp-brand ${mounted ? "visible" : ""}`}>
            <div className="lp-brand-monogram">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2.5L3 7.5v10h4.5v-5h5v5H17v-10L10 2.5z" fill="none" stroke="#b8965a" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="lp-brand-name">
              <span className="lp-brand-title">TechKraft</span>
              <span className="lp-brand-sub">Realty Group</span>
            </div>
          </div>

          <div className={`lp-panel-copy ${mounted ? "visible" : ""}`}>
            <div className="lp-rule" />
            <h2 className="lp-headline">
              <span className="lp-hl-light">Your next home</span>
              Find the<br /><em>perfect</em><br />address
            </h2>
            <p className="lp-panel-desc">
              Curated listings, intelligent shortlists, and real‑time updates — all in one beautifully simple portal.
            </p>
          </div>

          <div className={`lp-stats ${mounted ? "visible" : ""}`}>
            {[["2,400+", "Active listings"], ["98%", "Verified agents"], ["12 yr", "Market trust"]].map(([n, l]) => (
              <div className="lp-stat" key={l}>
                <p className="lp-stat-n">{n}</p>
                <p className="lp-stat-l">{l}</p>
              </div>
            ))}
          </div>
        </aside>

        <main className={`lp-form-wrap ${mounted ? "visible" : ""}`}>

          <div className="lp-eyebrow">
            <span className="lp-eyebrow-line" />
            <span className="lp-eyebrow-text">Buyer Portal</span>
          </div>

          <h1 className="lp-heading">{heading}</h1>
          <p className="lp-sub-text">
            {mode === "login"
              ? "Sign in to manage your shortlist and track properties you love."
              : "Register as a buyer and start building your property shortlist."}
          </p>

          <div className="lp-tabs" role="tablist">
            <button
              className={`lp-tab ${mode === "login" ? "active" : ""}`}
              type="button"
              onClick={() => handleModeSwitch("login")}
            >
              Sign in
            </button>
            <button
              className={`lp-tab ${mode === "register" ? "active" : ""}`}
              type="button"
              onClick={() => handleModeSwitch("register")}
            >
              Register
            </button>
          </div>

          <form
            className={`lp-form lp-form-card ${shake ? "shake" : ""}`}
            onSubmit={handleSubmit}
          >
            {error && (
              <div className="lp-error" role="alert" aria-live="assertive">
                <svg className="lp-error-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="10" cy="10" r="8" />
                  <path d="M10 6.5v3.5M10 13.5h.01" strokeLinecap="round" />
                </svg>
                <p className="lp-error-text">{error}</p>
              </div>
            )}

            {mode === "register" && (
              <div className="lp-field visible" style={{ transitionDelay: "0.05s" }}>
                <label className="lp-label" htmlFor="lp-name">Full name</label>
                <input
                  id="lp-name"
                  className="lp-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aadarsh Jha"
                  required
                  autoComplete="name"
                />
              </div>
            )}

            <div className="lp-field visible" style={{ transitionDelay: "0.1s" }}>
              <label className="lp-label" htmlFor="lp-email">Email address</label>
              <input
                id="lp-email"
                type="email"
                className="lp-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="lp-field visible" style={{ transitionDelay: "0.15s" }}>
              <label className="lp-label" htmlFor="lp-password">Password</label>
              <div className="lp-input-wrap">
                <input
                  id="lp-password"
                  type={showPassword ? "text" : "password"}
                  className="lp-input has-icon"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  className="lp-eye-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="lp-submit" disabled={submitting}>
              {submitting ? (
                <span className="lp-dots"><span /><span /><span /></span>
              ) : mode === "login" ? (
                "Sign in →"
              ) : (
                "Create account →"
              )}
            </button>
          </form>

      
        </main>
      </div>
    </>
  );
}