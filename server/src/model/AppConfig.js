import * as ConstVar from "../constant/ConstVar.js";

class AppConfig {
    host = ConstVar.DEFAULT_HOST;
    port = ConstVar.DEFAULT_PORT;
    lib_path = [];
    memMax = ConstVar.DEFAULT_MEM_MAX;
    vmMem = ConstVar.DEFAULT_VM_MEM;
    vmMax = ConstVar.DEFAULT_VM_MAX;

    constructor(config) {
        Object.assign(config, this);
    }


    init() {
        if (!this.lib_path) {
            this.lib_path = [];
        }
        if (!this.lib_path.includes(ConstVar.DEFAULT_LIB_PATH)) {
            this.lib_path.push(ConstVar.DEFAULT_LIB_PATH);
        }
    }
}

export default AppConfig;