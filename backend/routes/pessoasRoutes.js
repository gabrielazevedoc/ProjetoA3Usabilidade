const express = require('express');
const PessoasModel = require('../models/pessoasModel');
const { authenticate, requireEmpresa } = require('../middleware/auth');

const router = express.Router();

router.post('/', async (req, res) => {
  const requiredFields = ['nome', 'email', 'senha'];
  const missing = requiredFields.filter(field => !req.body[field]);

  if (missing.length > 0) {
    return res.status(400).json({ message: `Campos obrigatórios: ${missing.join(', ')}` });
  }

  try {
    const pessoa = await PessoasModel.createPessoa({
      ...req.body,
      quantidadeKg: req.body.quantidadeKg ? Number(req.body.quantidadeKg) : null
    });
    res.status(201).json(pessoa);
  } catch (error) {
    console.error('Erro ao criar pessoa física', error);
    res.status(500).json({ message: 'Erro ao criar pessoa física' });
  }
});

router.get('/', async (req, res) => {
  try {
    const pessoas = await PessoasModel.listPessoas(req.query);
    res.json(pessoas);
  } catch (error) {
    console.error('Erro ao listar pessoas físicas', error);
    res.status(500).json({ message: 'Erro ao listar pessoas físicas' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const pessoa = await PessoasModel.getPessoaById(req.params.id);
    if (!pessoa) {
      return res.status(404).json({ message: 'Pessoa física não encontrada' });
    }
    res.json(pessoa);
  } catch (error) {
    console.error('Erro ao recuperar pessoa física', error);
    res.status(500).json({ message: 'Erro ao recuperar pessoa física' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const pessoa = await PessoasModel.updatePessoa(req.params.id, {
      ...req.body,
      quantidadeKg: req.body.quantidadeKg ? Number(req.body.quantidadeKg) : undefined
    });
    if (!pessoa) {
      return res.status(404).json({ message: 'Pessoa física não encontrada' });
    }
    res.json(pessoa);
  } catch (error) {
    console.error('Erro ao atualizar pessoa física', error);
    res.status(500).json({ message: 'Erro ao atualizar pessoa física' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await PessoasModel.deletePessoa(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao remover pessoa física', error);
    res.status(500).json({ message: 'Erro ao remover pessoa física' });
  }
});

router.get('/:id/contato', authenticate, requireEmpresa, async (req, res) => {
  try {
    const contato = await PessoasModel.getContato(req.params.id);
    if (!contato) {
      return res.status(404).json({ message: 'Contato não encontrado' });
    }
    res.json(contato);
  } catch (error) {
    console.error('Erro ao recuperar contato', error);
    res.status(500).json({ message: 'Erro ao recuperar contato' });
  }
});

module.exports = router;
