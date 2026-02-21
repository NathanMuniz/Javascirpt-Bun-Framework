/**
 * Gera a pasta release/ com front + servidor compilado (um único executável).
 * Em produção: suba a pasta release/ e rode o executável.
 * Uso: bun run build && bun run release
 */
import { mkdir, cp } from "fs/promises";
import { existsSync } from "fs";

const RELEASE_DIR = "./release";

async function release() {
  console.log("Gerando release (front + servidor compilado)...\n");

  if (!existsSync("./dist/client.js") || !existsSync("./dist/index.html")) {
    console.error("Rode antes: bun run build");
    process.exit(1);
  }

  await mkdir(RELEASE_DIR, { recursive: true });

  await cp("./dist/index.html", `${RELEASE_DIR}/index.html`);
  await cp("./dist/client.js", `${RELEASE_DIR}/client.js`);
  console.log("✓ Frontend copiado para release/");

  const serverExe = process.platform === "win32" ? `${RELEASE_DIR}/server.exe` : `${RELEASE_DIR}/server`;
  const compileResult = await Bun.build({
    entrypoints: ["./server.ts"],
    minify: true,
    compile: { outfile: serverExe },
  });
  if (!compileResult.success) {
    throw new Error(compileResult.logs.map((l) => l.message).join("\n"));
  }
  console.log("✓ Servidor compilado (executável):", serverExe);

  console.log("\n--- Release pronto em release/ ---");
  console.log("  - index.html, client.js (front)");
  console.log("  - server (ou server.exe) = um único executável com o back");
  console.log("\nPara rodar em produção:");
  console.log("  1. Envie a pasta release/ para o servidor.");
  console.log("  2. No servidor: cd release");
  console.log("  3. STATIC_DIR=. ./server   (Linux/Mac)");
  console.log("     ou  set STATIC_DIR=. && server.exe   (Windows)");
  console.log("\nNão precisa ter Bun instalado no servidor: o executável já traz o runtime.");
}

release().catch((err) => {
  console.error(err);
  process.exit(1);
});
