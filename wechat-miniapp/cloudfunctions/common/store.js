const { createSeedData } = require("../../shared/seed");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

let memoryDb = createSeedData();

function loadDb() {
  return clone(memoryDb);
}

function saveDb(db) {
  memoryDb = clone(db);
  return clone(memoryDb);
}

function resetDb() {
  memoryDb = createSeedData();
  return clone(memoryDb);
}

async function withDb(operation) {
  const db = loadDb();
  const result = await operation(db);
  if (result && result.db) {
    saveDb(result.db);
  }
  return result;
}

module.exports = {
  loadDb,
  saveDb,
  resetDb,
  withDb
};
