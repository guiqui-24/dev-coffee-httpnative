const http = require('node:http');
const port = 3000;
const STATUS_VALIDO = ['pendente', 'pronto', 'cancelado'];

let orders = [];
let nextId = 1;

function sendJson (res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data));
}

function readBody (req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
        });
        req.on('end', () => resolve(body));
        req.on('error', reject);
    });
    }

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;
    const method = req.method;

    if (method === 'GET' && path === '/orders') {
        const status = url.searchParams.get('status');
        const resultado = status ? orders.filter(o => o.status === status) : orders;
        return sendJson(res, 200, resultado);
    }

    if (method === 'POST' && path === '/orders') {
        let dados;

        try {
            const body = await readBody(req);
            dados = JSON.parse(body);
        } catch (err) {
            return sendJson(res, 400, { error: 'Corpo da requisição inválido' });
        }

        if (dados === null || typeof dados !== 'object' || Array.isArray(dados)) {
            return sendJson(res, 400, { error: 'Corpo da requisição inválido' });
        }

        const {client, item } = dados;

        if (typeof client !== 'string' || client.trim() === '' || typeof item !== 'string' || item.trim() === '') {
            return sendJson(res, 400, { error: 'Os campos "client" e "item" são obrigatórios' });
        }

        const novoPedido = {
            id: nextId++,
            client: client.trim(),
            item: item.trim(),
            status: 'pendente'
        };

        orders.push(novoPedido);
        return sendJson(res, 201, novoPedido);
    }

    const matchId = path.match(/^\/orders\/(\d+)$/);
    const matchStatus = path.match(/^\/orders\/(\d+)\/status$/);

    if (method === 'GET' && matchId) {
    const id = Number(matchId[1]);
    const pedido = orders.find((o) => o.id === id);

    if (!pedido) {
      return sendJson(res, 404, { erro: 'Pedido não encontrado' });
    }
    return sendJson(res, 200, pedido);
  }

    if (method === 'DELETE' && matchId) {
    const id = Number(matchId[1]);
    const indice = orders.findIndex((o) => o.id === id);

    if (indice === -1) {
      return sendJson(res, 404, { erro: 'Pedido não encontrado' });
    }

    orders.splice(indice, 1);
    res.writeHead(204); 
    return res.end();
  }

    if (method === 'PATCH' && matchStatus) {
    const id = Number(matchStatus[1]);
    const pedido = orders.find((o) => o.id === id);

    if (!pedido) {
      return sendJson(res, 404, { erro: 'Pedido não encontrado' });
    }

    let dados;

    try {
        const body = await readBody(req);
        dados = JSON.parse(body);
    } catch (err) {
        return sendJson(res, 400, { error: 'Corpo da requisição inválido' });
    }

    if (dados === null || typeof dados !== 'object' || Array.isArray(dados)) {
        return sendJson(res, 400, { error: 'Corpo da requisição inválido' });
    }

    const { status } = dados;

    if (!STATUS_VALIDO.includes(status)) {
        return sendJson(res, 400, { error: 'Status inválido' });
    }

    pedido.status = dados.status;
    return sendJson(res, 200, pedido);
  }

    sendJson(res, 404, { error: 'Rota não encontrada' });
});

server.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
