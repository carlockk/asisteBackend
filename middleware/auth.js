// middleware/auth.js
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'secreto123';

function verificarToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido' });
  }
}

function soloAdmin(req, res, next) {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso solo para administradores' });
  }
  next();
}

function soloAdminOGestor(req, res, next) {
  if (!['admin', 'gestor'].includes(req.user.rol)) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  next();
}

module.exports = { verificarToken, soloAdmin, soloAdminOGestor };
