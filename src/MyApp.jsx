import { Sparkles, LogIn, LogOut, Mail, Lock, Eye, Search } from "lucide-react";

function MyApp() {
  return (
    <>
      <main className=".login-page">
        <section className="auth-card">
          <header className="auth-header">
            <h2>
              愛哆啦也愛<span className="text-accent">手作</span>
            </h2>
            <p>為熱愛手作的你而生的網站</p>
          </header>
          <form>
            <div className="form-floating mb-3">
              <Search className="input-icon" />
              <input
                className="form-control"
                id="search"
                name="search"
                type="text"
                placeholder="請輸入關鍵字"
              />
              <label htmlFor="search">輸入關鍵字...</label>
            </div>
          </form>
        </section>
      </main>
    </>
  );
}

export default MyApp;
