/* Copyright (c) 2016 Grant Miner */
'use strict';
import {Readable} from 'stream';
// https://github.com/koajs/koa/blob/v2.x/docs/api/index.md
import Promise from 'bluebird';
const adapt = require('koa-adapter-bluebird'); // uses bluebird-co for performance
// const adapt = require('koa-adapter');
const Koa = require('koa');
const app = module.exports = new Koa();
const fs = Promise.promisifyAll(require('fs'));
const config = require('../../../config/web.js');
const session = require('koa-session');
const Compress = require('koa-compress');
const helmet = require('koa-helmet');
const Morgan = require('koa-morgan');
const proxy = require('koa-proxy');
const KoaJwt = require('koa-jwt');
const Conditional = require('koa-conditional-get');
const Etag = require('koa-etag');
const ResponseTime = require('koa-response-time');
const BodyParser = require('koa-bodyparser');
const ServeStatic = require('koa-static');

if (config.proxy) {
	app.use(adapt(proxy({
		host: config.proxy,
		match: /^(?!\/api)(?!\/app)/ // ...everything except /api and /app
	})));
}

app.use(adapt(ResponseTime()));
app.use(adapt(Conditional()));
app.use(adapt(Etag()));
// app.use(Morgan('combined'));

const koaBunyanLogger = require('koa-bunyan-logger');
app.use(adapt(koaBunyanLogger()));
app.use(adapt(koaBunyanLogger.requestIdContext()));
app.use(adapt(koaBunyanLogger.requestLogger()));


app.use(helmet.frameguard());
app.use(helmet.xssFilter());
app.use(helmet.ieNoOpen());

app.use(adapt(Compress()));

app.keys = config.cookieKeys;

// Signed-cookies session support
// app.use(adapt(session({
// 	maxage: null
// }, app)));

app.use(adapt(BodyParser()));

// turn errors into a JSON structure
app.use(async (ctx, next) => {
	try {
		await next();
	} catch (err) {
		// some errors will have .status
		// however ctx is not a guarantee
		if (err != null) {
			ctx.status = err.status || 500;
			ctx.type = 'application/json';
			ctx.body = JSON.stringify({
				success: false,
				message: err.toString()
			})

			// since we handled ctx manually we'll
			// want to delegate to the regular app
			// level error handling as well so that
			// centralized still functions correctly.
			ctx.app.emit('error', err, ctx);
		} else {
			ctx.status = 500;
			ctx.type = 'application/json';
			ctx.body = JSON.stringify({
				success: false,
				message: 'null error'
			})
			// ctx.app.emit('error', new Error('null or undefined error'), ctx);
		}
	}
});

import {router} from './routes/router';

app.use(router.routes());
app.use(router.allowedMethods());
app.use(adapt(ServeStatic('../../public')));
