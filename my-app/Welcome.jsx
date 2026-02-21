import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

function Welcome() {
  return (
    <div>
      <h1>Bem-vindo ao Bun!</h1>
      <p>Seu ambiente está pronto para desenvolver.</p>
    </div>
  );
}

// Ao rodar o arquivo direto (bun run Welcome.jsx), mostra o HTML no terminal
console.log(renderToStaticMarkup(<Welcome />));

export default Welcome;
