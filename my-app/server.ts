// Resposta mockada — futuramente trocar por chamada à IA
function getMockReply(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  if (lower.includes("oi") || lower.includes("olá") || lower.includes("ola")) {
    return "Olá! Como posso ajudar?";
  }
  if (lower.includes("nome")) {
    return "Por enquanto sou um assistente mockado. Em breve serei uma IA!";
  }
  if (lower.includes("?")) {
    return "Essa é uma ótima pergunta. (Resposta mockada — em breve será uma IA real.)";
  }
  return `Você disse: "${userMessage}". Recebido! (Resposta mockada.)`;
}

const HOST = "localhost";
const PORT = 3000;

// Bundle do frontend (buildado na subida do servidor)
let clientJs: string | null = null;

async function buildClient() {
  const result = await Bun.build({
    entrypoints: ["./client.jsx"],
    minify: true,
    target: "browser",
  });
  if (!result.success) {
    console.error("Build do client falhou:", result.logs);
    return;
  }
  clientJs = await result.outputs[0].text();
}

await buildClient();

Bun.serve({
  hostname: HOST,
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const headers = new Headers();

    // CORS para o front chamar a API
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    // Página do chat
    if (url.pathname === "/" || url.pathname === "/index.html") {
      const html = await Bun.file("./index.html").text();
      headers.set("Content-Type", "text/html; charset=utf-8");
      return new Response(html, { headers });
    }

    // Bundle JS do frontend
    if (url.pathname === "/client.js") {
      if (!clientJs) return new Response("Client não buildado", { status: 500 });
      headers.set("Content-Type", "application/javascript; charset=utf-8");
      return new Response(clientJs, { headers });
    }

    // API do chat
    if (url.pathname === "/api/chat" && req.method === "POST") {
      try {
        const body = (await req.json()) as { message?: string };
        const message = typeof body?.message === "string" ? body.message.trim() : "";
        const reply = message ? getMockReply(message) : "Envie uma mensagem de texto.";
        return new Response(JSON.stringify({ reply }), {
          headers: { ...Object.fromEntries(headers), "Content-Type": "application/json" },
        });
      } catch {
        return new Response(JSON.stringify({ reply: "Erro ao processar a mensagem." }), {
          status: 400,
          headers: { ...Object.fromEntries(headers), "Content-Type": "application/json" },
        });
      }
    }

    return new Response("Not Found", { status: 404, headers });
  },
});

console.log(`Chat rodando em http://${HOST}:${PORT}/`);
