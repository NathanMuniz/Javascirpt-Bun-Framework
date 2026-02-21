import React, { useState } from "react";

function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMensagem(null);
    if (!nome.trim() || !email.trim() || !senha) {
      setMensagem({ tipo: "erro", texto: "Preencha todos os campos." });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome.trim(), email: email.trim(), senha }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMensagem({ tipo: "erro", texto: data?.erro ?? "Erro ao cadastrar." });
        return;
      }
      setMensagem({ tipo: "ok", texto: "Cadastro feito com sucesso!" });
      setNome("");
      setEmail("");
      setSenha("");
    } catch {
      setMensagem({ tipo: "erro", texto: "Erro de conexão." });
    } finally {
      setLoading(false);
    }
  }

  const base = { padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(30,41,59,0.8)", color: "#f8fafc", fontSize: 15 };
  return (
    <div style={styles.wrapper}>
      <h1 style={styles.title}>Cadastro</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          style={base}
          disabled={loading}
        />
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={base}
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          style={base}
          disabled={loading}
        />
        <button type="submit" disabled={loading} style={styles.btn}>
          {loading ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>
      {mensagem && (
        <p style={{ ...styles.msg, color: mensagem.tipo === "ok" ? "#4ade80" : "#f87171" }}>
          {mensagem.texto}
        </p>
      )}
      <a href="/" style={styles.link}>← Voltar ao Chat</a>
    </div>
  );
}

const styles = {
  wrapper: { padding: 24, maxWidth: 360, margin: "0 auto", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" },
  title: { margin: "0 0 20px", fontSize: 22, color: "#f8fafc" },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  btn: { padding: "12px 20px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)", color: "#0f172a", fontWeight: 600, cursor: "pointer", fontSize: 15 },
  msg: { marginTop: 16, fontSize: 14 },
  link: { display: "inline-block", marginTop: 20, color: "#38bdf8", fontSize: 14, textDecoration: "none" },
};

export default Cadastro;
