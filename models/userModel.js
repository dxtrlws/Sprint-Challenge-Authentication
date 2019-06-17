const db = require('../database/dbConfig');

module.exports = {
  add,
  find
};

async function add(user) {
  const [id] = await db('users').insert(user);
  return findById(id);
}

function findById(id) {
  return db('users')
    .where({ id })
    .first();
}

function find(username) {
    return db('users')
    .where(username)
    .first()
}