import React, { useState, useRef, useEffect } from "react";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      const reply = data?.reply ?? "Sem resposta.";
      setMessages((m) => [...m, { role: "bot", text: reply }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "bot", text: "Erro ao conectar com o servidor." }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <>
      <style>{`
        .chat-input::placeholder { color: rgba(248, 250, 252, 0.4); }
        .chat-input:focus { outline: none; box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.4); }
        .chat-btn:hover:not(:disabled) { background: #0ea5e9; transform: translateY(-1px); }
        .chat-btn:active:not(:disabled) { transform: translateY(0); }
        .chat-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .chat-msg { animation: chatFade 0.25s ease; }
        @keyframes chatFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes typingDot { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-4px); } }
        .typing-dot { animation: typingDot 1s ease-in-out infinite; }
        .typing-dot:nth-child(2) { animation-delay: 0.15s; }
        .typing-dot:nth-child(3) { animation-delay: 0.3s; }
      `}</style>
      <div style={styles.wrapper}>
        <header style={styles.header}>
          <div style={styles.headerIcon}>◆</div>
          <div style={{ flex: 1 }}>
            <h1 style={styles.title}>Chat</h1>
            <p style={styles.subtitle}>Assistente · Em breve com IA</p>
          </div>
          <a href="/cadastro" style={styles.headerLink}>Cadastro</a>
        </header>

        <div ref={listRef} style={styles.messages}>
          {messages.length === 0 && (
            <div style={styles.empty}>
              <div style={styles.emptyIcon}>💬</div>
              <p style={styles.emptyTitle}>Comece a conversa</p>
              <p style={styles.emptyText}>Envie uma mensagem e receba uma resposta em instantes.</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className="chat-msg"
              style={{
                ...styles.msgRow,
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              {msg.role === "bot" && <div style={styles.avatarBot}>◆</div>}
              <div
                style={{
                  ...styles.bubble,
                  ...(msg.role === "user" ? styles.bubbleUser : styles.bubbleBot),
                }}
              >
                {msg.text}
              </div>
              {msg.role === "user" && <div style={styles.avatarUser}>Você</div>}
            </div>
          ))}
          {loading && (
            <div style={{ ...styles.msgRow, justifyContent: "flex-start" }}>
              <div style={styles.avatarBot}>◆</div>
              <div style={{ ...styles.bubble, ...styles.bubbleBot, ...styles.typing }}>
                <span className="typing-dot" style={styles.dot} />
                <span className="typing-dot" style={styles.dot} />
                <span className="typing-dot" style={styles.dot} />
              </div>
            </div>
          )}
        </div>

        <div style={styles.footer}>
          <input
            type="text"
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem..."
            disabled={loading}
            style={styles.input}
          />
          <button
            type="button"
            className="chat-btn"
            onClick={send}
            disabled={loading || !input.trim()}
            style={styles.button}
            aria-label="Enviar"
          >
            Enviar
          </button>
        </div>
      </div>
    </>
  );
}

const styles = {
  wrapper: {
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    maxWidth: 520,
    margin: "0 auto",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
    boxShadow: "0 0 0 1px rgba(255,255,255,0.06)",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "20px 24px",
    background: "rgba(15, 23, 42, 0.8)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    flexShrink: 0,
  },
  headerLink: {
    color: "#38bdf8",
    fontSize: 14,
    fontWeight: 600,
    textDecoration: "none",
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)",
    color: "#0f172a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    fontWeight: 700,
  },
  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    color: "#f8fafc",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    margin: "2px 0 0",
    fontSize: 13,
    color: "rgba(248, 250, 252, 0.6)",
    fontWeight: 500,
  },
  messages: {
    flex: 1,
    overflow: "auto",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  empty: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.8,
  },
  emptyTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 600,
    color: "#f8fafc",
  },
  emptyText: {
    margin: "8px 0 0",
    fontSize: 14,
    color: "rgba(248, 250, 252, 0.5)",
    maxWidth: 260,
  },
  msgRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: 10,
  },
  avatarBot: {
    width: 32,
    height: 32,
    borderRadius: 10,
    background: "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)",
    color: "#0f172a",
    fontSize: 12,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarUser: {
    fontSize: 11,
    fontWeight: 600,
    color: "rgba(248, 250, 252, 0.5)",
    flexShrink: 0,
  },
  bubble: {
    padding: "12px 16px",
    borderRadius: 16,
    maxWidth: "78%",
    lineHeight: 1.5,
    fontSize: 15,
    boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
  },
  bubbleUser: {
    background: "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)",
    color: "#0f172a",
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    background: "rgba(255,255,255,0.08)",
    color: "#e2e8f0",
    border: "1px solid rgba(255,255,255,0.06)",
    borderBottomLeftRadius: 4,
  },
  typing: {
    display: "flex",
    gap: 4,
    alignItems: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "rgba(248, 250, 252, 0.5)",
    display: "inline-block",
  },
  footer: {
    display: "flex",
    gap: 10,
    padding: "16px 24px 24px",
    background: "rgba(15, 23, 42, 0.6)",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },
  input: {
    flex: 1,
    padding: "14px 18px",
    fontSize: 15,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(30, 41, 59, 0.8)",
    color: "#f8fafc",
    transition: "box-shadow 0.2s, border-color 0.2s",
  },
  button: {
    padding: "14px 22px",
    fontSize: 15,
    fontWeight: 600,
    borderRadius: 14,
    border: "none",
    background: "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)",
    color: "#0f172a",
    cursor: "pointer",
    transition: "background 0.2s, transform 0.15s",
  },
};

export default Chat;
