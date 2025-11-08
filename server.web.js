// server.web.js
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const distDir = path.join(__dirname, 'dist');

app.get('/healthz', (_req, res) => res.type('text').send('ok'));
app.use(express.static(distDir, { maxAge: '1h', immutable: true }));
app.get('*', (_req, res) => res.sendFile(path.join(distDir, 'index.html')));

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`WEB listening on ${port}`));
