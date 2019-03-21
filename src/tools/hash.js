// Hash a password.
// Usage: node hash.js password [rounds]
'use strict';

const Promise = require('bluebird');
const bcrypt = Promise.promisifyAll(require('bcryptjs'));

Promise.coroutine(function* (username) {
	let rounds = 10;
	if (process.argv[3]) {
		rounds = parseInt(process.argv[3]);
	}
	let salt = yield bcrypt.genSaltAsync(rounds);
	let hashedPassword = yield bcrypt.hashAsync(process.argv[2], salt);
	console.log(hashedPassword);
})();
