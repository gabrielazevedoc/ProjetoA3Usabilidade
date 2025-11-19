const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const PessoasModel = require('../models/pessoasModel');
const EmpresasModel = require('../models/empresasModel');

const router = express.Router();

function generateToken(user) {
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '8h' });
}

router.post('/login-pessoa', async (req, res) => {
  try {
    const pessoa = await PessoasModel.getPessoaByEmail(req.body.email);
    if (!pessoa) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const isValid = await bcrypt.compare(req.body.senha, pessoa.SenhaHash);
    if (!isValid) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const token = generateToken({ id: pessoa.Id, nome: pessoa.Nome, tipo: 'pessoa' });
    res.json({
      token,
      user: {
        id: pessoa.Id,
        nome: pessoa.Nome,
        tipo: 'pessoa'
      }
    });
  } catch (error) {
    console.error('Erro ao autenticar pessoa física', error);
    res.status(500).json({ message: 'Erro ao autenticar pessoa física' });
  }
});

router.post('/login-empresa', async (req, res) => {
  try {
    const empresa = await EmpresasModel.getEmpresaByEmail(req.body.email);
    if (!empresa) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const isValid = await bcrypt.compare(req.body.senha, empresa.SenhaHash);
    if (!isValid) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const token = generateToken({ id: empresa.Id, nome: empresa.RazaoSocial, tipo: 'empresa' });
    res.json({
      token,
      user: {
        id: empresa.Id,
        nome: empresa.RazaoSocial,
        tipo: 'empresa'
      }
    });
  } catch (error) {
    console.error('Erro ao autenticar empresa', error);
    res.status(500).json({ message: 'Erro ao autenticar empresa' });
  }
});

module.exports = router;
