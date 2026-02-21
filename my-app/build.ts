/**
 * Gera o bundle do frontend em dist/
 * Uso: bun run build
 */
import { mkdir, writeFile, cp } from "fs/promises";
import { existsSync } from "fs";

const OUT_DIR = "./dist";

async function build() {
  console.log("Criando bundle do frontend...\n");

  if (!existsSync(OUT_DIR)) {
    await mkdir(OUT_DIR, { recursive: true });
  }

  // 1. Bundle do client (React + Chat) em um único JS
  const result = await Bun.build({
    entrypoints: ["./client.jsx"],
    minify: true,
    target: "browser",
  });

  if (!result.success) {
    console.error("Erro no build:");
    for (const log of result.logs) console.error(log);
    process.exit(1);
  }

  const bundle = await result.outputs[0].text();
  await writeFile(`${OUT_DIR}/client.js`, bundle, "utf-8");
  console.log("✓ client.js gerado em dist/");

  // 2. Copiar index.html para dist/ (já referencia /client.js)
  await cp("./index.html", `${OUT_DIR}/index.html`);
  console.log("✓ index.html copiado para dist/");

  console.log("\nBundle pronto em dist/");
  console.log("  - dist/index.html");
  console.log("  - dist/client.js");
  console.log("\nRode o servidor com: bun run start");
  console.log("(O servidor usará os arquivos de dist/ automaticamente.)");
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
