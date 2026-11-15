"use client";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/provider";
import { ApiError, http } from "@/lib/client/http";

type Mode = "login" | "register";
type Res = { ok: true; name?: string } | { ok: false; err: string };
type Errs = Partial<Record<"name" | "email" | "password" | "confirm", string>>;

const input =
  "w-full min-h-11 rounded-xl border border-line bg-bg px-4 py-3 text-base text-text outline-none transition focus:border-gold focus:shadow-[0_0_0_4px_rgba(var(--glow),.15)] aria-[invalid=true]:border-[#ff8a6b]";
const errCls = "mt-1 block min-h-[1.1em] text-sm text-[#ff8a6b]";

function strength(v: string): number {
  return [v.length >= 8, /[A-Z]/.test(v), /\d/.test(v), /[^\w\s]/.test(v)].filter(Boolean).length;
}

export default function AuthForm({ mode }: { mode: Mode }) {
  const { t } = useI18n();
  const reg = mode === "register";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [errs, setErrs] = useState<Errs>({});
  const [pending, setPending] = useState(false);
  const score = strength(pw);

  function mapErr(key: string) {
    if (key === "errName") setErrs({ name: key });
    else if (key === "errPw") setErrs({ password: key });
    else if (key === "errEmail" || key === "emailTaken") setErrs({ email: key });
    else setErrs({ password: "wrongCred" });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    const n = name.trim(), em = email.trim();
    const next: Errs = {};
    if (reg && n.length < 3) next.name = "errName";
    if (!/^\S+@\S+\.\S+$/.test(em)) next.email = "errEmail";
    if (pw.length < 8) next.password = "errPw";
    if (reg && confirm !== pw) next.confirm = "errMatch";
    setErrs(next);
    if (Object.keys(next).length) return;

    setPending(true);
    try {
      const r = await http<Res>(reg ? "/api/auth/register" : "/api/auth/login", {
        body: reg ? { name: n, email: em, password: pw } : { email: em, password: pw, remember },
      });
      if (r.ok) { location.href = "/"; return; }
      mapErr(r.err);
    } catch (x) {
      mapErr(x instanceof ApiError ? (x.data?.err ?? "") : "");
    }
    setPending(false);
  }

  const msg = (k?: string) => (k ? t(k) : "");
  const label = "mb-1.5 block text-[.85rem] font-bold text-muted font-ui";

  return (
    <main className="mx-auto my-10 w-[min(920px,100%-2rem)]">
      <section className="ayah-card mx-auto w-[min(440px,100%)] rounded-card border border-line bg-surface px-[1.1rem] py-6 sm:px-8 sm:py-9">
        <div lang="ar" className="mb-2 text-center font-ar text-5xl font-bold leading-none text-gold [text-shadow:0_0_24px_rgba(var(--glow),.6)]">ق</div>
        <h1 className="mb-6 text-center font-head text-2xl font-semibold sm:text-[1.8rem]">{t(reg ? "regTitle" : "loginTitle")}</h1>
        <form onSubmit={submit} noValidate>
          {reg && (
            <div className="mb-4">
              <label htmlFor="af-name" className={label}>{t("username")}</label>
              <input id="af-name" name="name" type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)}
                aria-invalid={!!errs.name} aria-describedby="af-name-err" className={input} />
              <small id="af-name-err" role="alert" className={errCls}>{msg(errs.name)}</small>
            </div>
          )}
          <div className="mb-4">
            <label htmlFor="af-email" className={label}>{t("email")}</label>
            <input id="af-email" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!errs.email} aria-describedby="af-email-err" className={input} />
            <small id="af-email-err" role="alert" className={errCls}>{msg(errs.email)}</small>
          </div>
          <div className="mb-4">
            <label htmlFor="af-pw" className={label}>{t("password")}</label>
            <div className="relative">
              <input id="af-pw" name="password" type={showPw ? "text" : "password"} autoComplete={reg ? "new-password" : "current-password"}
                value={pw} onChange={(e) => setPw(e.target.value)} aria-invalid={!!errs.password} aria-describedby="af-pw-err"
                className={`${input} pr-20`} />
              <button type="button" onClick={() => setShowPw((s) => !s)} aria-controls="af-pw"
                className="absolute right-1 top-1/2 inline-flex min-h-11 -translate-y-1/2 items-center px-3 text-[.85rem] font-bold text-gold-soft">
                {t(showPw ? "hide" : "show")}
              </button>
            </div>
            {reg && (
              <div aria-hidden="true" className="relative mt-2 h-1 overflow-hidden rounded bg-line">
                <div className="absolute inset-y-0 left-0 bg-gold shadow-[0_0_10px_var(--color-gold)] transition-[width] duration-500" style={{ width: `${score * 25}%` }} />
              </div>
            )}
            <small id="af-pw-err" role="alert" className={errCls}>{msg(errs.password)}</small>
          </div>
          {reg && (
            <div className="mb-4">
              <label htmlFor="af-confirm" className={label}>{t("confirm")}</label>
              <input id="af-confirm" name="confirm" type={showPw ? "text" : "password"} autoComplete="new-password" value={confirm}
                onChange={(e) => setConfirm(e.target.value)} aria-invalid={!!errs.confirm} aria-describedby="af-confirm-err" className={input} />
              <small id="af-confirm-err" role="alert" className={errCls}>{msg(errs.confirm)}</small>
            </div>
          )}
          {!reg && (
            <label className="mb-5 flex min-h-11 cursor-pointer items-center gap-2 text-[.92rem]">
              <input type="checkbox" name="remember" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="size-5 accent-gold" />
              <span>{t("remember")}</span>
            </label>
          )}
          <button type="submit" disabled={pending}
            className="min-h-12 w-full cursor-pointer rounded-full border border-gold bg-gold px-4 py-3 text-base font-bold text-on-gold transition hover:brightness-110 disabled:cursor-wait disabled:opacity-50">
            {t(reg ? "register" : "login")}
          </button>
        </form>
        <p className="mt-6 text-center text-[.95rem] text-muted">
          <span>{t(reg ? "haveAcc" : "noAcc")}</span>
          <a href={reg ? "/login" : "/register"} className="ml-1 inline-flex min-h-11 items-center font-bold text-gold-soft hover:underline">
            {t(reg ? "login" : "register")}
          </a>
        </p>
      </section>
    </main>
  );
}
