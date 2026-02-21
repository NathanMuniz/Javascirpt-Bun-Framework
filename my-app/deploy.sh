#!/usr/bin/env bash
# Rode ESTE SCRIPT NO SERVIDOR, na pasta do projeto (depois de enviar os arquivos).
# Uso: chmod +x deploy.sh && ./deploy.sh

set -e
echo ">>> Instalando dependências..."
bun install --frozen-lockfile

echo ">>> Gerando bundle..."
bun run build

echo ">>> Pronto. Para subir o servidor:"
echo "    bun run start"
echo ""
echo "Para rodar em background (ex.: com nohup):"
echo "    nohup bun run start > app.log 2>&1 &"
echo "Ou configure um serviço systemd (veja comentários no script)."
