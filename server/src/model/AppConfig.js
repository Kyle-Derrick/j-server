const ConstVar = require("../constant/ConstVar.js");
const path = require("path");
const fs = require("fs");

const SCRIPT_SUFFIX = ".js";

function scriptConfigHandle(script) {
    const handled = [];
    script.forEach(s => {
        if (path.extname(s) === SCRIPT_SUFFIX) {
            handled.push(s);
            return;
        }
        const stats = fs.statSync(s);
        if (stats.isDirectory()) {
            const files = fs.readdirSync(s);
            for (let file of files) {
                let ext = path.extname(file);
                if (ext === SCRIPT_SUFFIX) {
                    handled.push(path.join(s, file))
                }
            }
        }
    });
    return handled;
}
class AppConfig {
    host = ConstVar.DEFAULT_HOST;
    port = ConstVar.DEFAULT_PORT;
    module = {};
    script = [];
    memMax = ConstVar.DEFAULT_MEM_MAX;
    vmMem = ConstVar.DEFAULT_VM_MEM;
    vmMax = ConstVar.DEFAULT_VM_MAX;
    waitMax = ConstVar.DEFAULT_WAIT_MAX;
    // second
    waitCheckCycle = ConstVar.DEFAULT_WAIT_CHECK_CYCLE;
    // second
    recoveryFreeMaxTime = ConstVar.DEFAULT_RECOVERY_FREE_MAX_TIME;
    forcedRecyclingTime = ConstVar.DEFAULT_FORCED_RECYCLING_TIME;
    evalTimeout = ConstVar.DEFAULT_EVAL_TIMEOUT;

    constructor(config) {
        if (!config || !Object.keys(config)) {
            return;
        }
        Object.assign(this, config);
    }


    init() {
        for (const key in ConstVar.DEFAULT_INCLUDE_MODULE) {
            if (key in this.module) {
                continue;
            }
            this.module[key] = ConstVar.DEFAULT_INCLUDE_MODULE[key];
        }

        if (this.script.length) {
            this.script = scriptConfigHandle(this.script);
        }
        if (!this.vmMem || this.vmMem <= 0) {
            this.vmMem = ConstVar.DEFAULT_VM_MEM;
        }
    }
}

module.exports = AppConfig;