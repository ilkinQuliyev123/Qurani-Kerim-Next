import LegacyScripts from "@/components/LegacyScripts";

export const metadata = { title: "Daxil ol — Qurani-Kərim" };

export default function LoginPage() {
  return (
    <>
      <link rel="stylesheet" href="/css/auth.css" />
      <main className="authwrap">
        <section className="ayah auth">
          <div className="auth__mark" lang="ar">ق</div>
          <h1 data-i18n="loginTitle"></h1>
          <form id="authForm" noValidate>
            <label className="fld"><span data-i18n="email"></span>
              <input type="email" name="email" autoComplete="email" /><small className="err" data-err="email" role="alert"></small></label>
            <label className="fld"><span data-i18n="password"></span>
              <div className="pw"><input type="password" name="password" autoComplete="current-password" /><button type="button" className="pw__eye" data-i18n="show"></button></div>
              <small className="err" data-err="password" role="alert"></small></label>
            <label className="chk"><input type="checkbox" name="remember" /><span data-i18n="remember"></span></label>
            <button className="btn btn--solid" type="submit" data-i18n="login"></button>
          </form>
          <p className="auth__alt"><span data-i18n="noAcc"></span><a href="/register" data-i18n="register"></a></p>
        </section>
      </main>
      <LegacyScripts srcs={["/js/auth.js"]} />
    </>
  );
}
