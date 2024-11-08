import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth';
import { clientsRouter } from './routes/clients';
import { supportsRouter } from './routes/supports';
import { reportsRouter } from './routes/reports';
import { statusRouter } from './routes/status';
import { prioridadesRouter } from './routes/prioridades';
import { solicitantesRouter } from './routes/solicitantes';
import nfseRouter from './routes/nfse';
import { authenticateToken } from './middleware/auth';

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://192.168.0.9:5173'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));

app.get('/', (req, res) => {
  res.json({ message: 'API do DB Support está funcionando!' });
});

// Rotas públicas
app.use('/api/auth', authRouter);

// Rotas protegidas
app.use('/api/clients', authenticateToken, clientsRouter);
app.use('/api/supports', authenticateToken, supportsRouter);
app.use('/api/reports', authenticateToken, reportsRouter);
app.use('/api/status', authenticateToken, statusRouter);
app.use('/api/prioridades', authenticateToken, prioridadesRouter);
app.use('/api/solicitantes', authenticateToken, solicitantesRouter);
app.use('/api/nfse', authenticateToken, nfseRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});