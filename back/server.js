const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Carregar variáveis de ambiente
dotenv.config();

// Conectar ao banco de dados
connectDB();

const app = express();

// Middlewares
app.use(cors()); // Permite requisições de diferentes origens (seu frontend)
app.use(express.json()); // Permite que o Express leia JSON do corpo da requisição

// Rotas
app.use('/api/auth', require('./routes/authRoutes')); // Rotas de autenticação
app.use('/api/users', require('./routes/userRoutes')); // Rotas para CRUD de usuários
app.use('/api/vehicles', require('./routes/vehicleRoutes')); // Rotas para CRUD de veículos
app.use('/api/services', require('./routes/serviceRoutes')); // Rotas para CRUD de serviços
app.use('/api/appointments', require('./routes/appointmentRoutes')); // Rotas para CRUD de agendamentos

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));