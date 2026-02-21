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

// Em produção use 0.0.0.0 para aceitar conexões externas
const HOST = process.env.HOST ?? "0.0.0.0";
const PORT = parseInt(process.env.PORT ?? "3000", 10);

// Onde estão os arquivos estáticos (dist/ em dev, "." no release)
const STATIC = process.env.STATIC_DIR ?? "./dist";
const hasDist = await Bun.file(`${STATIC}/client.js`).exists().catch(() => false);
let clientJs: string | null = null;

if (hasDist) {
  clientJs = await Bun.file(`${STATIC}/client.js`).text();
  console.log("Usando bundle estático");
} else {
  const result = await Bun.build({
    entrypoints: ["./client.jsx"],
    minify: true,
    target: "browser",
  });
  if (!result.success) {
    console.error("Build do client falhou:", result.logs);
  } else {
    clientJs = await result.outputs[0].text();
  }
}

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

    // API de cadastro (persiste em data/usuarios.json)
    if (url.pathname === "/api/cadastro" && req.method === "POST") {
      try {
        const body = (await req.json()) as { nome?: string; email?: string; senha?: string };
        const nome = typeof body?.nome === "string" ? body.nome.trim() : "";
        const email = typeof body?.email === "string" ? body.email.trim() : "";
        const senha = body?.senha;
        if (!nome || !email || !senha) {
          return new Response(JSON.stringify({ erro: "Preencha nome, e-mail e senha." }), {
            status: 400,
            headers: { ...Object.fromEntries(headers), "Content-Type": "application/json" },
          });
        }
        const dataDir = process.env.DATA_DIR ?? "./data";
        const file = `${dataDir}/usuarios.json`;
        const f = Bun.file(file);
        let list: { nome: string; email: string }[] = [];
        if (await f.exists()) {
          try {
            const existing = await f.text();
            if (existing.trim()) list = JSON.parse(existing);
          } catch {}
        }
        const { mkdirSync } = await import("fs");
        mkdirSync(dataDir, { recursive: true });
        if (list.some((u) => u.email === email)) {
          return new Response(JSON.stringify({ erro: "Este e-mail já está cadastrado." }), {
            status: 400,
            headers: { ...Object.fromEntries(headers), "Content-Type": "application/json" },
          });
        }
        list.push({ nome, email });
        await Bun.write(file, JSON.stringify(list, null, 2));
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...Object.fromEntries(headers), "Content-Type": "application/json" },
        });
      } catch (e) {
        return new Response(JSON.stringify({ erro: "Erro ao cadastrar." }), {
          status: 500,
          headers: { ...Object.fromEntries(headers), "Content-Type": "application/json" },
        });
      }
    }

    // Bundle JS do frontend
    if (url.pathname === "/client.js") {
      if (!clientJs) return new Response("Client não buildado", { status: 500 });
      headers.set("Content-Type", "application/javascript; charset=utf-8");
      return new Response(clientJs, { headers });
    }

    // SPA: qualquer outra rota devolve o index.html (Chat, Cadastro, etc.)
    const htmlPath = hasDist ? `${STATIC}/index.html` : "./index.html";
    const html = await Bun.file(htmlPath).text();
    headers.set("Content-Type", "text/html; charset=utf-8");
    return new Response(html, { headers });
  },
});

console.log(`Chat rodando em http://${HOST}:${PORT}/`);
