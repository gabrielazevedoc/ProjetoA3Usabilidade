const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

const pessoasRoutes = require('./routes/pessoasRoutes');
const empresasRoutes = require('./routes/empresasRoutes');
const authRoutes = require('./routes/authRoutes');

require('./config/db');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/pessoas', pessoasRoutes);
app.use('/api/empresas', empresasRoutes);
app.use('/api/auth', authRoutes);

const publicDir = path.resolve(__dirname, '..');
app.use(express.static(publicDir));

app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
});
