/* Copyright (c) 2016 Grant Miner */
"use strict";
const config = require("../../config/web.js");
// const Promise = require('bluebird');
// Promise.config({
// 	longStackTraces: config.longStackTraces
// });
// global.Promise = Promise;
const bunyan = require("bunyan");
const cluster = require("cluster");
const fs = require("fs");
const net = require("net");
const app = require("./lib/app");
const http = require("http");
const spdy = require("spdy");
const sticky = require("socketio-sticky-session");
const sockets = require("./lib/sockets");

const port = config.port;
const log = bunyan.createLogger({
  name: "server"
  // level: 'debug'
});

log.info("Starting server");

process.on("exit", function() {
  log.info(
    "Cluster master? " +
      cluster.isMaster +
      " Process exit at " +
      new Date().toISOString()
  );
});

process.title = 'agilegps-server';

let credentials;

if (config.spdy || config.https) {
  credentials = {
    key: fs.readFileSync("../../config/privkey.pem", "utf8"),
    cert: fs.readFileSync("../../config/cert.pem", "utf8")
  };
  if (!credentials) {
    log.error("SSL certs need to be installed for SPDY/HTTPS");
    process.exit(1);
  }
}

function getHttpServer() {
  let server = require("http").createServer(require("./lib/app").callback());
  sockets.register(require("socket.io").listen(server));
  return server;
}

function getTlsServer() {
  let server;
  if (config.spdy) {
    log.info("SPDY enabled");
    server = require("spdy").createServer(
      credentials,
      require("./lib/app").callback()
    );
  } else if (config.https) {
    log.info("HTTPS enabled");
    server = require("https").createServer(
      credentials,
      require("./lib/app").callback()
    );
  }
  sockets.register(require("socket.io").listen(server));
  return server;
}

const httpServer = getHttpServer();
const tlsServer = getTlsServer();

if (config.cluster) {
  let options = {
    ignoreMissingHeader: true
  };

  if (config.isReverseProxied) {
    options.proxy = true; //activate layer 4 patching
    options.header = "x-forwarded-for"; //provide here your header containing the users ip
  }

  if (httpServer) httpServer = sticky(options, httpServer);

  if (tlsServer) tlsServer = sticky(options, httpServer);
}

if (httpServer) {
  httpServer.listen(config.port, function() {
    log.info(
      "Sticky cluster worker " +
        (cluster.worker ? cluster.worker.id : "") +
        " server listening on port " +
        config.port
    );
  });
}

if (tlsServer) {
  tlsServer.listen(config.tlsport, function() {
    log.info(
      "TLS Sticky cluster worker " +
        (cluster.worker ? cluster.worker.id : "") +
        " server listening on port " +
        config.tlsport
    );
  });
}

if (process.setegid && process.getuid() === 0) {
  // if we are root
  // we have opened the sockets, now drop our root privileges
  process.setgid("nobody");
  process.setuid("nobody");
  // Newer node versions allow you to set the effective uid/gid
  if (process.setegid) {
    process.setegid("nobody");
    process.seteuid("nobody");
  }
}
