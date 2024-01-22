# Matey

This is a personal LLM UI built with [Nuxt 3](https://v3.nuxtjs.org/) and [LangChain](https://js.langchain.com/).

## Setup

Make sure to install the dependencies:

```bash
pnpm install
```

Then, you will need to install [Ollama](https://ollama.ai/download) on your machine and run it with your model of choice using the command:

```bash
ollama run <model_name>
```

Then, you will need to create a `.env` file in the root of the project and add the following variables:

```bash
OLLAMA_MODEL=
OLLAMA_URL=
```

The `OLLAMA_MODEL` variable should be the name of the model you are running with Ollama. The `OLLAMA_URL` variable should be the URL of the Ollama server, which is `http://localhost:11434` by default.

## Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm run dev
```

## Improvements

- [ ] Add a header and footer
- [ ] Improve CSS around the new message component
- [ ] Use previous messages as context for the next message
- [ ] Add a parser for code blocks
- [ ] Add a button to stop answers generation
- [ ] Add a button to clear the chat
- [ ] Save chats in local storage or local DB

## Useful links

- [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction)
- [LangChain documentation](https://js.langchain.com/docs/get_started/quickstart)
