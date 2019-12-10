/* Copyright (c) 2016 Grant Miner */
"use strict";
// https://github.com/koajs/koa/blob/v2.x/docs/api/index.md
const os = require('os');
const process = require('process');
const r = require("../../common/db")
const Koa = require("koa");
const app = (module.exports = new Koa());
const config = require("../../../config/web.js");
// const session = require("koa-session");
const Compress = require("kompression");
const helmet = require("koa-helmet");
// const Morgan = require("koa-morgan");
const Conditional = require("koa-conditional-get");
const Etag = require("koa-etag");
const ResponseTime = require("koa-response-time");
const BodyParser = require("koa-bodyparser");
const ServeStatic = require("koa-static");

app.use(ResponseTime());
app.use(Conditional());
app.use(Etag());
// app.use(Morgan('combined'));

const koaBunyanLogger = require("koa-bunyan-logger");
app.use(koaBunyanLogger());
// app.use(koaBunyanLogger.requestIdContext());
// app.use(koaBunyanLogger.requestLogger());

app.use(helmet.frameguard());
app.use(helmet.xssFilter());
app.use(helmet.ieNoOpen());

app.use(Compress());

app.keys = config.cookieKeys;

// Signed-cookies session support
// app.use(session({
// 	maxage: null
// }, app));

app.use(BodyParser());

// turn errors into a JSON structure
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    // some errors will have .status
    // however ctx is not a guarantee
    if (err != null) {
      ctx.status = err.status || 500;
      ctx.type = "application/json";
      ctx.body = JSON.stringify({
        success: false,
        message: err.toString()
      });

      // since we handled ctx manually we'll
      // want to delegate to the regular app
      // level error handling as well so that
      // centralized still functions correctly.
      ctx.app.emit("error", err, ctx);
    } else {
      nullOrUndefined = err === null ? "null" : "undefined";
      ctx.status = 500;
      ctx.type = "application/json";
      ctx.body = JSON.stringify({
        success: false,
        message: `${nullOrUndefined} error`
      });
      ctx.app.emit("error", new Error(`${nullOrUndefined} error`), ctx);
    }
  }
});

const router = require("./routes/router").router;

app.use(router.routes());
app.use(router.allowedMethods());
app.use(ServeStatic("../../public"), {
  'index': ['index.html', 'index.htm']
});

async function logError(err) {
  await r.table('errors').insert({
    host: os.hostname(),
    pid: process.pid,
    date: new Date(),
    stack: err.stack,
    argv: process.argv,
    cwd: process.cwd(),
    memory: process.memoryUsage(),
    uptime: process.uptime(),
    promise: false,
    uid: process.getuid && process.getuid(),
    groups: process.getgroups && process.getgroups(),
    load: os.loadavg()
  });
};

app.on('error', logError);
