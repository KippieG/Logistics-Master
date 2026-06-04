const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'yss-dev-secret-change-in-production';

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Niet ingelogd' });
  }
  try {
    const token = header.slice(7);
    req.company = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Sessie verlopen' });
  }
}

function signToken(company) {
  return jwt.sign(
    { id: company.id, alias: company.alias, zone: company.zone },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

module.exports = { requireAuth, signToken };
