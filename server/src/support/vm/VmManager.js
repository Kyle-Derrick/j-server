const ivm = require('isolated-vm');
const AppConfig = require("../../model/AppConfig.js");
class VmManager {
    config;
    memTotal;
    vmTotal;
    constructor(config) {
        if (!(config instanceof AppConfig)) {
            config = new AppConfig(config);
        }
        // Atomics.

        this.config = config;
    }

    getVm(callback) {
        if (this.vmTotal >= this.config.vmMax) {
        }
    }
}


const isolate = new ivm.Isolate({ memoryLimit: 128 });

const context = isolate.createContextSync();

const jail = context.global;
jail.setSync('global', jail.derefInto());

jail.setSync('log', function(...args) {
    console.log(...args);
});

context.evalSync('log("hello world")');

const hostile = isolate.compileScriptSync(`
	const storage = [];
	const twoMegabytes = 1024 * 1024 * 2;
	while (true) {
		const array = new Uint8Array(twoMegabytes);
		for (let ii = 0; ii < twoMegabytes; ii += 4096) {
			array[ii] = 1; // we have to put something in the array to flush to real memory
		}
		storage.push(array);
		log('I\\'ve wasted '+ (storage.length * 2)+ 'MB');
	}
`);

hostile.run(context).catch(err => console.error(err));
context.release()
isolate.dispose()