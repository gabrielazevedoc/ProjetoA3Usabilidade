const express = require('express');
const EmpresasModel = require('../models/empresasModel');

const router = express.Router();

router.post('/', async (req, res) => {
  const requiredFields = ['razaoSocial', 'nomeContato', 'telefone', 'email', 'senha'];
  const missing = requiredFields.filter(field => !req.body[field]);

  if (missing.length > 0) {
    return res.status(400).json({ message: `Campos obrigatórios: ${missing.join(', ')}` });
  }

  try {
    const empresa = await EmpresasModel.createEmpresa(req.body);
    res.status(201).json(empresa);
  } catch (error) {
    console.error('Erro ao criar empresa', error);
    res.status(500).json({ message: 'Erro ao criar empresa' });
  }
});

router.get('/', async (_req, res) => {
  try {
    const empresas = await EmpresasModel.listEmpresas();
    res.json(empresas);
  } catch (error) {
    console.error('Erro ao listar empresas', error);
    res.status(500).json({ message: 'Erro ao listar empresas' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const empresa = await EmpresasModel.getEmpresaById(req.params.id);
    if (!empresa) {
      return res.status(404).json({ message: 'Empresa não encontrada' });
    }
    res.json(empresa);
  } catch (error) {
    console.error('Erro ao recuperar empresa', error);
    res.status(500).json({ message: 'Erro ao recuperar empresa' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const empresa = await EmpresasModel.updateEmpresa(req.params.id, req.body);
    if (!empresa) {
      return res.status(404).json({ message: 'Empresa não encontrada' });
    }
    res.json(empresa);
  } catch (error) {
    console.error('Erro ao atualizar empresa', error);
    res.status(500).json({ message: 'Erro ao atualizar empresa' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await EmpresasModel.deleteEmpresa(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao remover empresa', error);
    res.status(500).json({ message: 'Erro ao remover empresa' });
  }
});

module.exports = router;
