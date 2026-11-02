/* eslint-disable */

/**
 * Gera `src/data/cards.json`, o baralho original que vai junto com o app.
 *
 * Fontes:
 *   node scripts/export-cards.js
 *     Lê a coleção pública `cards` do projeto Firebase de origem (API REST,
 *     sem credenciais). Rode uma vez só: cada carta conta como uma leitura na
 *     quota de quem mantém esse projeto.
 *
 *   node scripts/export-cards.js --from-file caminho/cartas.json
 *     Usa um array já salvo, como o cache `@CARDS_AGAINST_HUMANITY/CARDS` do
 *     localStorage de um navegador que abriu o site original.
 *
 * Nada é gravado se a leitura falhar no meio ou se os dados forem inválidos.
 */

const fs = require('fs');
const path = require('path');

const SOURCE_PROJECT =
  process.env.CARDS_SOURCE_PROJECT || 'cards-against-humanity-16605';
const OUTPUT = path.join(__dirname, '..', 'src', 'data', 'cards.json');
const PAGE_SIZE = 300;

async function fetchFromFirestore() {
  const base = `https://firestore.googleapis.com/v1/projects/${SOURCE_PROJECT}/databases/(default)/documents/cards`;
  const cards = [];
  let pageToken = '';

  do {
    const url = `${base}?pageSize=${PAGE_SIZE}${
      pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ''
    }`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `A API respondeu ${response.status}. Com 429, a quota do projeto de origem acabou: tente depois ou use --from-file.`
      );
    }

    const page = await response.json();

    (page.documents || []).forEach((document) => {
      cards.push({
        id: document.name.split('/').pop(),
        type: document.fields?.type?.stringValue,
        message: document.fields?.message?.stringValue,
      });
    });

    pageToken = page.nextPageToken || '';
  } while (pageToken);

  return cards;
}

function readFromFile(file) {
  const parsed = JSON.parse(fs.readFileSync(file, 'utf8').replace(/^﻿/, ''));

  if (!Array.isArray(parsed)) {
    throw new Error('O arquivo precisa conter um array de cartas.');
  }

  return parsed.map(({ id, type, message }) => ({ id, type, message }));
}

function validate(cards) {
  const problems = [];
  const ids = new Set();

  cards.forEach((card, index) => {
    if (!card.id || ids.has(card.id)) {
      problems.push(`#${index}: id ausente ou repetido (${card.id})`);
    }

    ids.add(card.id);

    if (card.type !== 'WHITE' && card.type !== 'BLACK') {
      problems.push(`#${index}: tipo inválido (${card.type})`);
    }

    if (typeof card.message !== 'string' || !card.message.trim()) {
      problems.push(`#${index}: mensagem vazia`);
    }
  });

  if (cards.length === 0) {
    problems.push('nenhuma carta encontrada');
  }

  if (problems.length > 0) {
    throw new Error(`Dados inválidos:\n${problems.join('\n')}`);
  }
}

async function main() {
  const fromFileIndex = process.argv.indexOf('--from-file');
  const cards =
    fromFileIndex !== -1
      ? readFromFile(process.argv[fromFileIndex + 1])
      : await fetchFromFirestore();

  validate(cards);

  cards.sort((a, b) => a.id.localeCompare(b.id));

  // Grava em arquivo temporário e renomeia: um erro nunca deixa JSON pela metade.
  const temporary = `${OUTPUT}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(cards, null, 2)}\n`);
  fs.renameSync(temporary, OUTPUT);

  const blacks = cards.filter(({ type }) => type === 'BLACK').length;

  console.log(
    `${cards.length} cartas salvas em src/data/cards.json (${
      cards.length - blacks
    } respostas, ${blacks} perguntas).`
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
