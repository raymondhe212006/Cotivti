import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import { generate_report } from './index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/sample', (_req, res) => {
    res.sendFile(path.join(__dirname, 'test_input.json'));
});

app.post('/api/run', async (req, res) => {
    try {
        const { proposal, personas } = req.body;
        const result = await generate_report(proposal, (personas || []).join('\n'));
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
