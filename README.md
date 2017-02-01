# Agile GPS: Open Source Fleet Tracking

![screenshot](https://raw.githubusercontent.com/llambda/agilegps/master/public/images/screen1.png?token=AGc1MoMRLFILb287jsksqBY-hvOtCRakks5Ym6-uwA%3D%3D)

## Features

1. Compatible with Queclink GV300 and GV500 trackers.
1. UDP data transmission from trackers with server acknowledgement (lower cellular data usage than TCP)
1. Customers, fleets, devices, and users
1. Site admins and org admins
1. Multi tenant. Multiple organizations (customers) per instance
1. Displays vehicles and fleets on Google Maps in real time
1. Display per-vehicle daily history on Google Maps
1. Node.js back end for high performance and concurrency
1. Stateless architecture, load balance across unlimited app nodes
1. Stateless authentication via JWT
1. RethinkDB enables atomic, realtime changefeeds. Clients efficiently receive changes in real-time, as they happen. Easy scaling, sharding and replication.
1. Fleet and vehicle reports: Start/stop, Ignition-based trips, Idling, Mileage by state, Odometer by state, Speed, Vehicle summary, OBD-II diagnostics (GV 500 only), OBD-II engine summaries (GV 500 only)
1. Localization: English and Russian language translations. English and metric units (per-user preference)
1. Free reverse geocoding (closest city) or via Google Reverse Geocoding API for obtaining addresses from latitude / longitude coordinates sent by the trackers.
1. Fast single page web interface via Mithril (component based like React). Responsive design on desktop and mobile browsers.

## Installation Guide

### Environment Setup
1. You need at a minimum Node.js 4.0.

1. Install the babel-cli: ```npm i -g babel-cli```

1. Install RethinkDB.

1. Start a RethinkDB instance. To start a rethinkdb instance, run the command:

```
rethinkdb
```



It will creates its working files in the current directory.

1. Verify you can access the RethinkDB admin console at http://localhost:8080

## Project Setup

1. In the cloned *agilegps* folder, run ```npm install``` to install the dependencies from package.json.

2. Run ```npm run webpack```. This builds the front end based on the package.json scripts section which is using webpack.

## Schema Setup

1. ```cd agilegps/src/tools```

1. Run ```babel-node schema.js``` to create the DB, tables, and indexes. It’s safe to run this multiple times because it does not drop any DB objects. Verify that the tables exist in the RethinkDB admin console. It should only take a few seconds to run.

1. Run ```babel-node createAnAdmin.js admin password``` to create an Admin user.

## Building the Front End
1. ```npm run watch``` from the root of the project will run webpack in watch mode, continually rebuilding the front end as changes are made.
1. ```npm run webpack``` from the root of the project runs webpack once, to rebuild the front end a single time.


## Building the Back End
1. ```npm run build``` from the root of the project will run babel. The built version is used by processes.json for production usage since it uses less memory than *node-babel*.

## Running the Application

1. ```cd agilegps/src/server```
1. ```node runner``` starts the web server, listening for file system code changes and automatically restarting the web server process on change, for easier development.
1. ```babel-node server``` starts the server without listening for file system changes.
1. ```babel-node debug server``` runs the server in the debugger.
2. Node 6.3.0 and later has V8 Inspector integration which allows attaching Chrome DevTools to Node.js instances for debugging and profiling: https://nodejs.org/api/debugger.html#debugger_v8_inspector_integration_for_node_js 
1. You should be able to access and login to the app at http://localhost:3000

## Running the Message Listener

The message listener (also known as the message gateway or just gateway) receives messages from tracker devices and inserts into the database. The message listener can be started and stopped independently of the web server.

1. ```cd agilegps/src/listener```
1. Run: ```babel-node listen.js```
1. To debug, ```babel-node debug listen.js```

## Deploying to Production

The *processes.json* file is pre-configured for PM2 which is a convenient way to run the app in production. PM2 can be installed to automatically run the app at system startup, log process output, etc.

1. Put your Google Maps API key in ```config/geocoding.js```

1. Configure *agilegps/config/web.json*
   1. isReverseProxied - if you are behind a reverse proxy, set this to true
   1. cluster - true to use all CPUs
   1. jwtSecret - you should generate a random long string here. This string is used to sign the JWT tokens.
   1. cookieKeys - you should generate an array of two strings. These are used to sign the session cookies. The array allows you to rotate in new keys.

1. Configure *agilegps/config/listener.js*

1. ```pm2 start processes.json```  
