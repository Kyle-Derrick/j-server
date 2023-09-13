const ConstVar = require("../constant/ConstVar.js");
// const {DEFAULT_RECOVERY_FREE_MAX_TIME, DEFAULT_WAIT_CHECK_CYCLE} = require('../constant/ConstVar.js');

class AppConfig {
    host = ConstVar.DEFAULT_HOST;
    port = ConstVar.DEFAULT_PORT;
    lib_path = [];
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
        Object.assign(config, this);
    }


    init() {
        if (!this.lib_path) {
            this.lib_path = [];
        }
        if (!this.lib_path.includes(ConstVar.DEFAULT_LIB_PATH)) {
            this.lib_path.push(ConstVar.DEFAULT_LIB_PATH);
        }
        if (!this.vmMem || this.vmMem <= 0) {
            this.vmMem = ConstVar.DEFAULT_VM_MEM;
        }
    }
}

module.exports = AppConfig;