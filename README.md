# Matey

This is a personal LLM UI built with [Nuxt 3](https://v3.nuxtjs.org/) and [LangChain](https://js.langchain.com/). It communicates with a local [Ollama](https://ollama.ai/) server to generate responses. Built with [Electron](https://www.electronjs.org/fr/docs/latest/) into a desktop app.

## Setup

Make sure to install the dependencies with `PNPM` or whatever package manager you prefer:

```sh
pnpm install
```

Then, you will need to install [Ollama](https://ollama.ai/download) on your machine and run it with your model of choice using the command:

```sh
ollama run <model_name>
```

## Development Server

Start the development server on `http://localhost:3000`:

```sh
pnpm run dev
```

## Build

Build the project for production:

```sh
pnpm run build
```

Checkout the `release` folder for the built app.

## Linting

Run the linter:

```sh
pnpm run lint
```

## Upcoming improvements

- Save chats in local DB
- Better name and logo
