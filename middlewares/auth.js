const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'] || '';
    const tokenFromHeader = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    const token = tokenFromHeader || (req.cookies && req.cookies.token);
    if (!token) {
      // If this is a UI route, redirect to home with prompt
      if (req.originalUrl && req.originalUrl.startsWith('/app')) {
        return res.redirect('/?needLogin=1');
      }
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    if (req.originalUrl && req.originalUrl.startsWith('/app')) {
      return res.redirect('/?needLogin=1');
    }
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    if (req.originalUrl && req.originalUrl.startsWith('/app')) {
      return res.redirect('/?needLogin=1');
    }
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };


