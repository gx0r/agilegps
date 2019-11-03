## Volta

Developers may consider using [volta](https://volta.sh/) to manage Node versions.

## Building the Front End
1. ```npm run watch``` from the root of the project will run webpack in watch mode, continually rebuilding the front end as changes are made, as well as restarting the backend and listener when their files change.

1. ```npm run webpack``` from the root of the project runs webpack once, to rebuild the front end a single time.

## Debugging the Web App

1. ```cd agilegps/src/server```
1. ```node server-watch``` starts the web server, listening for file system code changes and automatically restarting the web server process on change, for easier development.
1. ```node server``` starts the server without listening for file system changes.
1. ```node debug server``` runs the server in the debugger.
2. Node 6.3.0 and later has V8 Inspector integration which allows attaching Chrome DevTools to Node.js instances for debugging and profiling: https://nodejs.org/api/debugger.html#debugger_v8_inspector_integration_for_node_js 
1. You should be able to access and login to the app at http://localhost:3000

## Debugging the Message Listener

1. ```cd agilegps/src/listener```
1. Run: ```node listen.js```
1. To debug, ```node debug listen.js```
