import {program} from "commander";
import Server from "./AppServer.js";

program.version('1.0.0');
program.option('-c, --config <path>', 'config file path set');
program.parse(process.argv);
const options = program.opts();

const server = new Server(options);
console.log(server.config)