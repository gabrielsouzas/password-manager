# MySafe 🛡️ - Gerenciador de Senhas Offline

O **MySafe** é um gerenciador de senhas desktop moderno, leve e seguro, desenvolvido com **Electron**. Ele permite que você armazene suas credenciais localmente com criptografia de nível militar, garantindo que seus dados nunca saiam do seu computador.

## ✨ Funcionalidades

- **Segurança Master:** Acesso protegido por uma senha mestre (armazenada com Hash SHA-256).
- **Criptografia AES-256:** Todas as senhas são criptografadas antes de serem salvas no disco.
- **Busca Inteligente:** Pesquisa instantânea por descrição, URL ou nome de usuário.
- **Limpeza Automática:** A área de transferência é limpa automaticamente 30 segundos após copiar uma senha.
- **Interface Clean:** UI amigável com cores leves e ícones intuitivos.
- **100% Offline:** Não utiliza banco de dados externo ou conexão com a nuvem.

## 🚀 Tecnologias Utilizadas

- [Electron](https://www.electronjs.org/) - Framework para apps desktop.
- [CryptoJS](https://cryptojs.gitbook.io/docs/) - Biblioteca de padrões de criptografia.
- [JavaScript/HTML/CSS] - Base da interface e lógica.
- [Bootstrap Icons] - Conjunto de ícones elegante.

## 🛠️ Como rodar o projeto

### Pré-requisitos

- [Node.js](https://nodejs.org/) instalado.

### Instalação

1. Clone o repositório:
   ```bash
   git clone [https://github.com/gabrielsouzas/password-manager.git](https://github.com/gabrielsouzas/password-manager.git)
   ```

````

2. Entre na pasta do projeto:
```bash
cd password-manager

````

3. Instale as dependências:

```bash
npm install

```

### Execução

Para iniciar o aplicativo em modo de desenvolvimento:

```bash
npm start

```

### Gerar Executável (Build)

Para gerar o instalador (`.exe`) e a versão portátil para Windows:

```bash
npm run dist

```

## 🔒 Arquitetura de Segurança

O projeto utiliza o conceito de **Ponte de Segurança (Preload Script)** do Electron para isolar a interface do sistema de arquivos:

1. **Processo Principal (Main):** Gerencia a persistência dos dados no arquivo `data.json`.
2. **Preload:** Atua como um garçom seguro, expondo apenas as funções de criptografia necessárias.
3. **Processo de Renderização (Renderer):** Lida com a UI e garante que a chave master nunca saia da memória volátil durante a sessão.

> **Importante:** Se você esquecer sua Senha Master, não há como recuperar os dados, pois o hash SHA-256 é irreversível e a chave AES depende da sua senha.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](https://www.google.com/search?q=LICENSE) para detalhes.

---

Desenvolvido por Gabriel Souza - Sinta-se à vontade para contribuir!
