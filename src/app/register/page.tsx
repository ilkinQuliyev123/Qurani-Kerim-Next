import LegacyScripts from "@/components/LegacyScripts";

export const metadata = { title: "Qeydiyyat — Qurani-Kərim" };

export default function RegisterPage() {
  return (
    <>
      <link rel="stylesheet" href="/css/auth.css" />
      <main className="authwrap">
        <section className="ayah auth">
          <div className="auth__mark" lang="ar">ق</div>
          <h1 data-i18n="regTitle"></h1>
          <form id="authForm" noValidate>
            <label className="fld"><span data-i18n="username"></span>
              <input type="text" name="username" autoComplete="username" /><small className="err" data-err="username" role="alert"></small></label>
            <label className="fld"><span data-i18n="email"></span>
              <input type="email" name="email" autoComplete="email" /><small className="err" data-err="email" role="alert"></small></label>
            <label className="fld"><span data-i18n="password"></span>
              <div className="pw"><input type="password" name="password" autoComplete="new-password" /><button type="button" className="pw__eye" data-i18n="show"></button></div>
              <div id="strength"></div><small className="err" data-err="password" role="alert"></small></label>
            <label className="fld"><span data-i18n="confirm"></span>
              <input type="password" name="confirm" autoComplete="new-password" /><small className="err" data-err="confirm" role="alert"></small></label>
            <button className="btn btn--solid" type="submit" data-i18n="register"></button>
          </form>
          <p className="auth__alt"><span data-i18n="haveAcc"></span><a href="/login" data-i18n="login"></a></p>
        </section>
      </main>
      <LegacyScripts srcs={["/js/auth.js"]} />
    </>
  );
}
