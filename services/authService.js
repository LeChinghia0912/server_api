const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/userRepository");
const AppError = require("../utils/AppError");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

async function register({ name, email, password, role = 'customer', phone, date_of_birth, gender, province, district, ward, address }) {
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    throw new AppError("Email already in use", 409);
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = await userRepository.create({ name, email, password: hashedPassword, role, phone, date_of_birth, gender, province, district, ward, address });
  const token = generateToken({ userId: user.id, email: user.email, role: user.role });
  return { user, token };
}

async function login({ email, password }) {
  const userWithSecret = await userRepository.findByEmail(email, { includePassword: true });
  if (!userWithSecret) {
    throw new AppError("Invalid email or password", 401);
  }
  const isMatch = bcrypt.compareSync(password, userWithSecret.password);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }
  if (String(userWithSecret.role) !== 'admin' && String(userWithSecret.role) !== 'customer') {
    throw new AppError("Access denied: admin only", 403);
  }
  const { password: _, ...safeUser } = userWithSecret;
  const token = generateToken({ userId: safeUser.id, email: safeUser.email, role: safeUser.role });
  return { user: safeUser, token };
}

module.exports = { register, login };


