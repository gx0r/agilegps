'use strict';
const os = require('os');

module.exports = function(r, opts) {
    opts = opts || {
        table: 'errors'
    };

	if (!opts.filter) {
		opts.filter = () => true;
	}

	if (! typeof opts.filter === 'function') {
		throw new TypeError('opts.filter must be a function');
	}
	if (! typeof opts.table === 'string') {
		throw new TypeError('opts.table must be a string');
	}

    function getStack(errOrPromise) {
        if (errOrPromise == null) {
            return null;
        } else if (errOrPromise.stack != null) {
            return errOrPromise.stack;
        } else {
            return errOrPromise;
        }
    }

    function insert(errOrPromise, isPromise) {
		var firstStep;

		if (opts.filter(errOrPromise)) {
			firstStep = r.table(opts.table).insert({
	            host: os.hostname(),
	            pid: process.pid,
	            date: new Date(),
	            stack: getStack(errOrPromise),
	            argv: process.argv,
	            cwd: process.cwd(),
	            memory: process.memoryUsage(),
	            uptime: process.uptime(),
	            promise: isPromise,
	            uid: process.getuid(),
	            groups: process.getgroups(),
	            load: os.loadavg()

	        }).run()
		} else {
			firstStep = Promise.resolve();
		}
        firstStep
        .catch(function (err) {
            // If the DB is unavailable, we would go in an infinite loop trying to keep inserting exceptions.
            console.error(getStack(err));
        })

		return firstStep;
    }

    function handleUncaughtException(err) {
        console.error((new Date).toUTCString() + ' uncaughtException:', getStack(err))
        return insert(err, false)
            .finally(function() {
                process.exit(1)
            })
    };

    function handleUnhandledRejection(reason, promise) {
        console.error((new Date).toUTCString() + ' unhandledPromiseRejection:', getStack(reason))
        return insert(reason, true);
    };

    process.on('uncaughtException', handleUncaughtException);
    process.on('unhandledRejection', handleUnhandledRejection);
}