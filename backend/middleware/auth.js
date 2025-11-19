const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token não encontrado' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
}

function requireEmpresa(req, res, next) {
  if (!req.user || req.user.tipo !== 'empresa') {
    return res.status(403).json({ message: 'Apenas empresas autenticadas podem acessar' });
  }
  next();
}

module.exports = {
  authenticate,
  requireEmpresa
};
