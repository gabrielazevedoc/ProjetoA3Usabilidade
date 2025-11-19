const bcrypt = require('bcryptjs');
const { poolPromise, sql } = require('../config/db');

async function createEmpresa(data) {
  const pool = await poolPromise;
  const senhaHash = await bcrypt.hash(data.senha, 10);

  const result = await pool.request()
    .input('RazaoSocial', sql.NVarChar(150), data.razaoSocial)
    .input('NomeContato', sql.NVarChar(150), data.nomeContato)
    .input('Telefone', sql.NVarChar(20), data.telefone)
    .input('Email', sql.NVarChar(150), data.email)
    .input('SenhaHash', sql.NVarChar(255), senhaHash)
    .input('Cnpj', sql.NVarChar(20), data.cnpj || null)
    .query(`
      INSERT INTO Empresas (RazaoSocial, NomeContato, Telefone, Email, SenhaHash, Cnpj)
      OUTPUT INSERTED.*
      VALUES (@RazaoSocial, @NomeContato, @Telefone, @Email, @SenhaHash, @Cnpj)
    `);

  return result.recordset[0];
}

async function listEmpresas() {
  const pool = await poolPromise;
  const result = await pool.request()
    .query('SELECT Id, RazaoSocial, NomeContato, Telefone, Email, Cnpj, CreatedAt FROM Empresas ORDER BY CreatedAt DESC');
  return result.recordset;
}

async function getEmpresaById(id) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('Id', sql.Int, id)
    .query('SELECT * FROM Empresas WHERE Id = @Id');
  return result.recordset[0] || null;
}

async function getEmpresaByEmail(email) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('Email', sql.NVarChar(150), email)
    .query('SELECT * FROM Empresas WHERE Email = @Email');
  return result.recordset[0] || null;
}

async function updateEmpresa(id, data) {
  const pool = await poolPromise;
  const fields = [];
  const request = pool.request().input('Id', sql.Int, id);

  if (data.razaoSocial !== undefined) {
    fields.push('RazaoSocial = @RazaoSocial');
    request.input('RazaoSocial', sql.NVarChar(150), data.razaoSocial);
  }
  if (data.nomeContato !== undefined) {
    fields.push('NomeContato = @NomeContato');
    request.input('NomeContato', sql.NVarChar(150), data.nomeContato);
  }
  if (data.telefone !== undefined) {
    fields.push('Telefone = @Telefone');
    request.input('Telefone', sql.NVarChar(20), data.telefone);
  }
  if (data.email !== undefined) {
    fields.push('Email = @Email');
    request.input('Email', sql.NVarChar(150), data.email);
  }
  if (data.cnpj !== undefined) {
    fields.push('Cnpj = @Cnpj');
    request.input('Cnpj', sql.NVarChar(20), data.cnpj || null);
  }
  if (data.senha) {
    const senhaHash = await bcrypt.hash(data.senha, 10);
    fields.push('SenhaHash = @SenhaHash');
    request.input('SenhaHash', sql.NVarChar(255), senhaHash);
  }

  if (fields.length === 0) {
    return getEmpresaById(id);
  }

  await request.query(`
    UPDATE Empresas SET ${fields.join(', ')} WHERE Id = @Id;
  `);

  return getEmpresaById(id);
}

async function deleteEmpresa(id) {
  const pool = await poolPromise;
  await pool.request()
    .input('Id', sql.Int, id)
    .query('DELETE FROM Empresas WHERE Id = @Id');
}

module.exports = {
  createEmpresa,
  listEmpresas,
  getEmpresaById,
  getEmpresaByEmail,
  updateEmpresa,
  deleteEmpresa
};
