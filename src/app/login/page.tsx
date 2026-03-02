"use client";

import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      body: formData,
    });

    setLoading(false);
    if (!response.ok) {
      setError("Usuario o contraseña incorrectos.");
      return;
    }

    window.location.href = "/";
  }

  return (
    <main className="crm-shell" style={{ maxWidth: 460, minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <section className="crm-card" style={{ width: "100%", padding: 20 }}>
        <h1 className="crm-title text-2xl mb-1">Acceso CRM Celuma</h1>
        <p className="text-sm text-slate-500 mb-5">Introduce tus credenciales para continuar</p>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <div className="crm-label">Email</div>
            <input className="crm-input" type="email" name="email" required defaultValue="administracion@celuma.es" />
          </div>
          <div>
            <div className="crm-label">Contraseña</div>
            <input className="crm-input" type="password" name="password" required />
          </div>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <button className="crm-btn crm-btn-primary" disabled={loading} type="submit">
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </section>
    </main>
  );
}
