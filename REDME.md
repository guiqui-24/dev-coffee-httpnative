# Dev Coffee API

API RESTful para gerenciar a fila de pedidos da cafeteria Dev Coffee, construída com o módulo nativo `node:http`, **sem nenhuma dependência externa** (sem Express, Fastify ou NestJS). Os dados ficam em memória e são zerados quando o servidor reinicia.

## Autor

- **Nome:** Guilherme da Silva Garcia
- **Curso:** Análise e Desenvolvimento de Sistemas
- **Atividade:** AP2 - Desenvolvimento Back-End

## Requisitos

- Node.js 18 ou superior

## Como executar

```bash
git clone https://github.com/guiqui-24/dev-coffee-httpnative.git
cd dev-coffee-httpnative
npm start
```

O servidor sobe em `http://localhost:3000`. Não é necessário rodar `npm install`.

## Modelo do recurso

```json
{
  "id": 1,
  "client": "Nome do Cliente",
  "item": "Tipo de item",
  "status": "pendente"
}
```

O campo `status` aceita apenas: `pendente`, `pronto` ou `cancelado`.

## Endpoints

| Método | Rota | Retornos |
|---|---|---|
| GET | `/orders` | 200 |
| GET | `/orders/:id` | 200, 404 |
| POST | `/orders` | 201, 400 |
| PATCH | `/orders/:id/status` | 200, 400, 404 |
| DELETE | `/orders/:id` | 204, 404 |
| qualquer outra | `/*` | 404 |

## Exemplos de requisição (cURL)

### Listar todos os pedidos

```bash
curl http://localhost:3000/orders
```

### Filtrar pedidos por status

```bash
curl "http://localhost:3000/orders?status=pendente"
```

### Buscar pedido por ID

```bash
curl http://localhost:3000/orders/1
```

### Criar pedido

```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{"client": "Guilherme", "item": "Cappuccino"}'
```

Resposta (201 Created):

```json
{ "id": 1, "client": "Guilherme", "item": "Cappuccino", "status": "pendente" }
```

### Atualizar status do pedido

```bash
curl -X PATCH http://localhost:3000/orders/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "pronto"}'
```

### Remover pedido

```bash
curl -X DELETE http://localhost:3000/orders/1
```

Resposta: `204 No Content` (corpo vazio).

### Rota inexistente

```bash
curl http://localhost:3000/qualquer-coisa
```

Resposta (404):

```json
{ "erro": "Rota não encontrada" }
```

## Decisões técnicas

- Corpo das requisições POST e PATCH lido via eventos de stream (`req.on('data')` e `req.on('end')`).
- `JSON.parse` protegido com `try/catch`: JSON malformado retorna 400 sem derrubar o servidor.
- Todas as respostas com corpo usam `Content-Type: application/json; charset=utf-8` (exceto 204).
- IDs sequenciais gerados automaticamente; status inicial sempre `pendente`.