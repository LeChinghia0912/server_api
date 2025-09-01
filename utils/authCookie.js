function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,
  });
}

module.exports = { setAuthCookie };


