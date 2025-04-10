const { tryCatchSync } = require('./error');
const { tryCatch } = require('./error');

module.exports = {
    tryCatch: tryCatch,
    tryCatchSync: tryCatchSync,
}