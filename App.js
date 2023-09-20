const {program} = require('commander');
const AppServer = require('./core/AppServer.js');
const path = require("path");

const default_config_path = path.join(__dirname, 'config', 'application.yml');
program.version('1.1.2');
program.option('-c, --config <path>', 'config file path set', default_config_path);
program.parse(process.argv);
const options = program.opts();

const server = new AppServer(options);
console.log(`current config: 
${server.config}`)
server.start();