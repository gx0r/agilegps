/* Copyright (c) 2016 Grant Miner */
'use strict';
import Promise from 'bluebird';
import assert from 'assert';
import JWT from 'jsonwebtoken';
Promise.promisifyAll(JWT);
import unless from 'koa-unless';
import {jwtSecret} from '../../../config/web.js';

export function jwtSignDefault (obj, options) {
    options || {};
    // options.expiresInMinutes = 60;
    return JWT.sign(obj, jwtSecret, options);
}

export function jwtCookie(opts) {
	opts = opts || {};
	opts.key = opts.key || 'user';
	assert(opts.secret, '"secret" option is required');

	const middleware = async function(ctx, next) {
		const token = ctx.cookies.get('jwt');
		let user, err;

		try {
			user = await JWT.verify(token, opts.secret, opts);
		} catch (e) {
			err = e;
		}

		if (user != null) {
			ctx.state = ctx.state || {};
			ctx.state[opts.key] = user;
		}

		if (user != null || opts.passthrough) {
			await next();
		} else {
			ctx.throw(401, err);
		}
	}

	middleware.unless = unless;
	return middleware;
};
