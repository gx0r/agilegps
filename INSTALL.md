
# Installation Guide

### Environment Setup
1. [Red Hat® Enterprise Linux® / RHEL](https://www.redhat.com/en/technologies/linux-platforms/enterprise-linux) or [CentOS](https://www.centos.org/) is recommended for your server's operating system.

1. Install [node.js](https://nodejs.org/). The latest Node.js long-term support (LTS) version is recommended. [Node Source](https://github.com/nodesource/distributions/blob/master/README.md#rpm) provides pacakges for enterprise Linux. 

1. [Install RethinkDB](https://rethinkdb.com/docs/install/centos/)

1. Start a RethinkDB instance. To start a rethinkdb instance, run the command `rethinkdb`. RethinkDB will create its working files in the current directory.

1. Verify you can access the RethinkDB admin console at http://localhost:8080

## Project Setup

1. In the cloned *agilegps* folder, run ```npm install``` to install the dependencies from package.json.

1. Run ```npm run webpack```. This builds the front-end.

1. Place your Google Maps key in `agilegps/public/app/index.html` on the appropriate script tag. This is necessary for the map to display.

1. (Optional) replace the Google Analytics code with your Google Analytics in `agilegps/public/app/index.html` for site analytics.

## Schema Initialization

1. ```cd agilegps/src/tools```

1. Run ```node schema.js``` to create the DB, tables, and indexes. It’s safe to run this multiple times because it does not drop any DB objects. Verify that the tables exist in the RethinkDB admin console. It should only take a few seconds to run.

1. Run ```node createAnAdmin.js admin password``` to create an Admin user named "admin" with password "password". Use a username and password of your choosing.

## Running the Application

1. ```cd agilegps/src/server```
1. ```node server``` starts the server without listening for file system changes.
1. You should be able to access and login to the app at http://localhost:3000

## Running the Message Listener

The message listener (also known as the message gateway or just gateway) is a separate process from the web server that receives messages from tracker devices and inserts their reported data into the database. The message listener can be started and stopped independently of the web server.

1. ```cd agilegps/src/listener```
1. Run: ```node listen.js```

## Deploying to Production

The `processes.json` file is pre-configured for [PM2](http://pm2.keymetrics.io/) which is a convenient way to run the app in production. PM2 can be installed to automatically run the app at system startup, log process output, etc.

1. (Optional) Put your Google Maps API key in ```config/geocoding.js``` if using Google Reverse Geocoding

1. Configure `agilegps/config/listener.js`

1. Configure `agilegps/config/web.json`
   1. isReverseProxied - if you are behind a reverse proxy, set this to true
   1. cluster - set this to true to use all CPUs
   1. jwtSecret - you should generate a random long string here using a command like `pwgen 64`. This string is used to sign the JWT tokens.
   1. cookieKeys - you should generate an array of two more strings using a command like `pwgen 64`. These are used to sign the session cookies. The array allows you to rotate in new keys.

1. ```pm2 start processes.json```  

## Tools

1. [location generator](https://github.com/llambda/agilegps/blob/master/src/tools/locgenerator.js) - generate random GPS data for an IMEI
1. [faker](https://github.com/llambda/agilegps/blob/master/src/tools/faker.js) - Load event data from a file and send as if it came from GPS units.
1. [Create an Admin](https://github.com/llambda/agilegps/blob/master/src/tools/createAnAdmin.js)
1. [base64 encoder and decoder](https://decodotron.com/)
