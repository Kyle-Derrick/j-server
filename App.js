const {program} = require('commander');
const AppServer = require('./core/AppServer.js');

program.version('1.0.0');
program.option('-c, --config <path>', 'config file path set');
program.parse(process.argv);
const options = program.opts();

const server = new AppServer(options);
console.log(server.config)
server.start();