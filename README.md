# Músicas da Rádio Rock 89,1 FM

Olá, este é um simples robozinho feito em __NodeJS__ para salvar a lista de todas as músicas que são tocadas na programação da Rádio Rock.

A lista é salva em um Banco de Dados NOSQL Firebase e também em um arquivo local chamado data.json.

O html, consulta o banco de dados, exibe as músicas e possibilita o filtro.

Para que o sistema funcione, é preciso que o serviço esteja rodando infinitamente.

Para executar uma vez:

```
node index.js
```

Caso queira deixar rodando:

```
node index.js > output.log & disown
```

A lista de músicas pode ser vista em: https://diogocezar.github.io/dctb-nodejs-radiorock/

É isso!

<3
