const bcrypt = require('bcryptjs');
const { poolPromise, sql } = require('../config/db');

const DEFAULT_PAGE_SIZE = 20;

function sanitizePagination(value, defaultValue) {
  const number = parseInt(value, 10);
  return Number.isNaN(number) || number <= 0 ? defaultValue : number;
}

async function createPessoa(data) {
  const pool = await poolPromise;
  const senhaHash = await bcrypt.hash(data.senha, 10);

  const result = await pool.request()
    .input('Nome', sql.NVarChar(150), data.nome)
    .input('Telefone', sql.NVarChar(20), data.telefone || null)
    .input('Email', sql.NVarChar(150), data.email)
    .input('SenhaHash', sql.NVarChar(255), senhaHash)
    .input('Latitude', sql.Float, data.latitude || null)
    .input('Longitude', sql.Float, data.longitude || null)
    .input('TipoResiduo', sql.NVarChar(50), data.tipoResiduo || null)
    .input('QuantidadeKg', sql.Decimal(10, 2), data.quantidadeKg || null)
    .input('Observacoes', sql.NVarChar(500), data.observacoes || null)
    .query(`
      INSERT INTO PessoasFisicas
        (Nome, Telefone, Email, SenhaHash, Latitude, Longitude, TipoResiduo, QuantidadeKg, Observacoes)
      OUTPUT INSERTED.*
      VALUES (@Nome, @Telefone, @Email, @SenhaHash, @Latitude, @Longitude, @TipoResiduo, @QuantidadeKg, @Observacoes)
    `);

  return result.recordset[0];
}

async function listPessoas(query = {}) {
  const pool = await poolPromise;
  const page = sanitizePagination(query.page, 1);
  const limit = sanitizePagination(query.limit, DEFAULT_PAGE_SIZE);
  const offset = (page - 1) * limit;

  const result = await pool.request()
    .input('Offset', sql.Int, offset)
    .input('Limit', sql.Int, limit)
    .query(`
      SELECT Id, Nome, Telefone, Email, Latitude, Longitude, TipoResiduo, QuantidadeKg, Observacoes, CreatedAt
      FROM PessoasFisicas
      ORDER BY CreatedAt DESC
      OFFSET @Offset ROWS
      FETCH NEXT @Limit ROWS ONLY;
      SELECT COUNT(*) AS Total FROM PessoasFisicas;
    `);

  return {
    items: result.recordsets[0] || [],
    total: result.recordsets[1]?.[0]?.Total || 0,
    page,
    limit
  };
}

async function getPessoaById(id) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('Id', sql.Int, id)
    .query('SELECT * FROM PessoasFisicas WHERE Id = @Id');
  return result.recordset[0] || null;
}

async function getPessoaByEmail(email) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('Email', sql.NVarChar(150), email)
    .query('SELECT * FROM PessoasFisicas WHERE Email = @Email');
  return result.recordset[0] || null;
}

async function updatePessoa(id, data) {
  const pool = await poolPromise;
  const fields = [];
  const request = pool.request().input('Id', sql.Int, id);

  if (data.nome !== undefined) {
    fields.push('Nome = @Nome');
    request.input('Nome', sql.NVarChar(150), data.nome);
  }
  if (data.telefone !== undefined) {
    fields.push('Telefone = @Telefone');
    request.input('Telefone', sql.NVarChar(20), data.telefone || null);
  }
  if (data.email !== undefined) {
    fields.push('Email = @Email');
    request.input('Email', sql.NVarChar(150), data.email);
  }
  if (data.latitude !== undefined) {
    fields.push('Latitude = @Latitude');
    request.input('Latitude', sql.Float, data.latitude || null);
  }
  if (data.longitude !== undefined) {
    fields.push('Longitude = @Longitude');
    request.input('Longitude', sql.Float, data.longitude || null);
  }
  if (data.tipoResiduo !== undefined) {
    fields.push('TipoResiduo = @TipoResiduo');
    request.input('TipoResiduo', sql.NVarChar(50), data.tipoResiduo || null);
  }
  if (data.quantidadeKg !== undefined) {
    fields.push('QuantidadeKg = @QuantidadeKg');
    request.input('QuantidadeKg', sql.Decimal(10, 2), data.quantidadeKg || null);
  }
  if (data.observacoes !== undefined) {
    fields.push('Observacoes = @Observacoes');
    request.input('Observacoes', sql.NVarChar(500), data.observacoes || null);
  }
  if (data.senha) {
    const senhaHash = await bcrypt.hash(data.senha, 10);
    fields.push('SenhaHash = @SenhaHash');
    request.input('SenhaHash', sql.NVarChar(255), senhaHash);
  }

  if (fields.length === 0) {
    return getPessoaById(id);
  }

  await request.query(`
    UPDATE PessoasFisicas
    SET ${fields.join(', ')}
    WHERE Id = @Id;
  `);

  return getPessoaById(id);
}

async function deletePessoa(id) {
  const pool = await poolPromise;
  await pool.request()
    .input('Id', sql.Int, id)
    .query('DELETE FROM PessoasFisicas WHERE Id = @Id');
}

async function getContato(id) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('Id', sql.Int, id)
    .query('SELECT Id, Nome, Telefone, Email FROM PessoasFisicas WHERE Id = @Id');
  return result.recordset[0] || null;
}

module.exports = {
  createPessoa,
  listPessoas,
  getPessoaById,
  getPessoaByEmail,
  updatePessoa,
  deletePessoa,
  getContato
};
