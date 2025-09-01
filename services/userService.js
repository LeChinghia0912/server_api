const userRepository = require("../repositories/userRepository");

async function listUsers() {
  return userRepository.findAll();
}

async function getUserById(id) {
  return userRepository.findById(id);
}

async function createUser(payload) {
  return userRepository.create(payload);
}

async function updateUser(id, payload) {
  return userRepository.update(id, payload);
}

async function deleteUser(id) {
  return userRepository.remove(id);
}

module.exports = {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
