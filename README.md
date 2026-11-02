<h1 align="center">Cartas Contra a Humanidade</h1>

<p align="center">Jogo de cartas on-line em português, com humor adulto, para jogar com os amigos. Não oficial.</p>

<p align="center"><img width="100" src="./public/favicon.png" /></p>

- Entrada só com nick e ícone, sem cadastro.
- Partidas em tempo real, com convite por link e chat.
- Tema claro, escuro e automático, com quatro temas de cor.
- Ranking de vitórias, suporte a celular e instalação como app (PWA).

Feito com React, Vite, Chakra UI e Firebase (Firestore e Auth anônimo).

## Rodando localmente

Precisa de Node 22 (`.nvmrc`) e, para os emuladores, Java 21+.

```bash
npm install
```

```bash
cp .env.example .env
```

Em `.env`, preencha `VITE_FIREBASE_PROJECT_ID=demo-cah`, `VITE_FIREBASE_API_KEY=demo`, `VITE_FIREBASE_APP_ID=demo` e `VITE_USE_EMULATORS=true`. Depois, em dois terminais:

```bash
npm run emulators
```

```bash
npm run dev
```

## Deploy

### 1. Firebase

1. Crie um projeto em [console.firebase.google.com](https://console.firebase.google.com). O plano gratuito Spark basta.
2. Em **Firestore Database**, crie o banco.
3. Em **Authentication > Sign-in method**, ative **Anônimo**.
4. Em **Configurações do projeto > Seus apps**, crie um app Web e guarde a configuração.
5. Publique as regras:

```bash
npx firebase login
```

```bash
npx firebase use --add
```

```bash
npm run deploy:rules
```

### 2. Vercel

1. Importe o seu repositório. O preset Vite é detectado sozinho.
2. Em **Environment Variables**, cadastre as variáveis de `.env.example` com os valores do passo anterior. Deixe `VITE_USE_EMULATORS` de fora.
3. Faça o deploy.
4. No Firebase, em **Authentication > Settings > Authorized domains**, adicione o domínio da Vercel.

### 3. Limpeza automática

Os workflows em `.github/workflows` encerram partidas abandonadas e apagam as antigas. Sem isso, o banco cresce até estourar a cota gratuita. No seu repositório GitHub, crie o secret `FIREBASE_SERVICE_ACCOUNT_KEY` com o JSON de uma conta de serviço (**Configurações do projeto > Contas de serviço**). `prune-matches` só roda à mão, com `dry_run` ligado por padrão.

## Cartas

O baralho fica no repositório e não consome leituras do banco:

- `src/data/cards.json`: baralho original, gerado por `scripts/export-cards.js`.
- `src/data/cards-extra.json`: cartas autorais, listadas em `docs/cartas-novas.md`.

Para adicionar uma carta, inclua `{ "id", "type", "message" }` no JSON e faça um novo deploy. `type` é `WHITE` (resposta) ou `BLACK` (pergunta), e `[?]` marca uma lacuna. Não reaproveite ids: partidas em andamento apontam para eles.

## Testes

```bash
npm run test:rules
```

## Segurança

As regras permitem que qualquer jogador conectado edite qualquer partida, e o placar é calculado no navegador. Isso basta para jogar entre amigos, mas o ranking pode ser fraudado e partidas podem ser adulteradas. Trate isso em `firestore.rules` antes de abrir o jogo ao público.

## Créditos e licença

- Jogo original: [Cards Against Humanity](https://www.cardsagainsthumanity.com/), sob licença Creative Commons BY-NC-SA: **sem uso comercial**. O nome é marca registrada de seus donos, e este projeto não tem vínculo com eles.
- Código original: [SilvanoGPM/cards-against-humanity](https://github.com/SilvanoGPM/cards-against-humanity).
- [PDF em português do jogo](https://www.ludopedia.com.br/jogo/cards-against-humanity/anexos/104033).

## Atenção

Conteúdo adulto, para maiores de 18 anos. É só humor, nunca agressão.
