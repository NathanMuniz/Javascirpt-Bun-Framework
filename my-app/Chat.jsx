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
    <div style={styles.container}>
      <h1 style={styles.title}>Chat</h1>
      <div ref={listRef} style={styles.messages}>
        {messages.length === 0 && (
          <p style={styles.placeholder}>Envie uma mensagem para começar.</p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              ...styles.bubble,
              ...(msg.role === "user" ? styles.userBubble : styles.botBubble),
            }}
          >
            {msg.text}
          </div>
        ))}
        {loading && <div style={styles.bubble}>...</div>}
      </div>
      <div style={styles.footer}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem..."
          disabled={loading}
          style={styles.input}
        />
        <button onClick={send} disabled={loading || !input.trim()} style={styles.button}>
          Enviar
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "system-ui, sans-serif",
    maxWidth: 480,
    margin: "0 auto",
    padding: 16,
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
  },
  title: {
    margin: "0 0 16px",
    fontSize: 24,
  },
  messages: {
    flex: 1,
    overflow: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    padding: "8px 0",
  },
  placeholder: {
    color: "#666",
    margin: 0,
  },
  bubble: {
    padding: "10px 14px",
    borderRadius: 12,
    maxWidth: "85%",
    alignSelf: "flex-start",
  },
  userBubble: {
    alignSelf: "flex-end",
    background: "#1a73e8",
    color: "white",
  },
  botBubble: {
    background: "#f1f3f4",
    color: "#202124",
  },
  footer: {
    display: "flex",
    gap: 8,
    paddingTop: 8,
  },
  input: {
    flex: 1,
    padding: "10px 14px",
    fontSize: 16,
    borderRadius: 8,
    border: "1px solid #ddd",
    outline: "none",
  },
  button: {
    padding: "10px 20px",
    fontSize: 16,
    borderRadius: 8,
    border: "none",
    background: "#1a73e8",
    color: "white",
    cursor: "pointer",
  },
};

export default Chat;
