const ivm = require('isolated-vm');
const AppConfig = require('../../model/AppConfig.js');
const {APP_CONTENT, DEFAULT_MODULE} = require('../../constant/ConstVar.js');

function createVm(config) {
    return new ivm.Isolate({
        memoryLimit: config.vmMem,
        onCatastrophicError(e) {
            console.error("虚拟机管理发生非常严重的错误: ", e);
            // todo 关闭方式
            process.abort();
        }
    });
}
class VmManager {
    config;
    vmTotal = 0;
    defaultVm;
    usedVm = new Map();
    freeVm = [];
    waitQueue = [];
    callbackTask;
    cleanFreeTask;
    constructor(config) {
        if (!(config instanceof AppConfig)) {
            config = new AppConfig(config);
        }

        this.config = config;
        const defaultVm = createVm(config);
        this.defaultVm = {
            vm: defaultVm
        };
        for (let key in DEFAULT_MODULE) {
            this.defaultVm[key] = defaultVm.compileModuleSync(`import ${key} from '${DEFAULT_MODULE[key]}';`);
        }

        const funcs = [];
        if (config.recoveryFreeMaxTime > 0) {
            funcs.push(() => {
                if (!this.freeVm.length) {
                    return
                }
                const now = Date.now();
                this.freeVm.filter(({time, vm}) => {
                    if ((time - now) >= (config.recoveryFreeMaxTime * 1000)) {
                        vm.dispose();
                        return false;
                    }
                    return true;
                })
            });
        }
        if (config.forcedRecyclingTime > 0) {
            funcs.push(() => {
                if (!this.usedVm.size) {
                    return
                }
                const now = Date.now();
                const invalidVm = [];
                this.usedVm.forEach((token, {time, vm}) => {
                    if ((time - now) >= (config.forcedRecyclingTime * 1000)) {
                        vm.dispose();
                        invalidVm.push(token);
                    }
                })
                invalidVm.forEach(token => this.usedVm.delete(token));
            });
        }
        if (funcs.length > 0) {
            this.cleanFreeTask = setInterval(() => {
                funcs.forEach(func => {
                    func();
                })
            }, config.recoveryFreeMaxTime * 1000)
        }

        process.on('SIGINT', this.dispose);
        process.on('SIGTERM', this.dispose);
        process.on('exit', this.dispose);
    }

    getDefaultVm() {
        return this.defaultVm;
    }

    reference(obj) {
        return new ivm.Reference(obj);
    }

    evalWithDefaultVm(param, init, success, failed, envFailed) {
        let {
            timeout = APP_CONTENT.config.evalTimeout,
            script
        } = param;
        const defaultVm = APP_CONTENT.vmManager.getDefaultVm();
        defaultVm.vm
            .createContext()
            .then(context => {
                init(context, defaultVm);
                timeout = Math.min(timeout, APP_CONTENT.config.evalTimeout) * 1000;
                context.eval(script, {timeout})
                    .then(success).catch(failed).finally(() => context.release())
            }).catch(envFailed);
    }

    getVm(token, callback) {
        if (token in this.usedVm) {
            const vmContent = this.usedVm[token];
            vmContent.time = Date.now();
            callback(vmContent.vm, () => this.releaseVm(token, vmContent.vm));
            return
        }
        if (this.freeVm.length > 0) {
            const {vm} = this.freeVm.pop();
            this.usedVm[token] = vm;
            callback(vm, () => this.releaseVm(token, vm));
        } else if (!this.config.vmMax || this.vmTotal < this.config.vmMax) {
            const vm = createVm(this.config);
            this.usedVm[token] = {time: Date.now(), vm};
            this.vmTotal++;
            callback(vm, () => this.releaseVm(token, vm));
        } else {
            this.addWait({token, callback});
        }
    }
    dispose() {
        this.usedVm.forEach((k, {vm}) => {
            vm.dispose();
        })
        this.freeVm.forEach(({vm}) => {
            vm.dispose();
        });
    }
    releaseVm(token, vm) {
        this.freeVm.push({
            time: Date.now(),
            vm
        });
        delete this.usedVm[token];
    }
    addWait(waitContent) {
        if (!this.config.waitMax || this.waitQueue.length < this.config.waitMax) {
            this.waitQueue.push(waitContent);
            const that = this;
            if (!that.callbackTask) {
                function callbackTask() {
                    if (!that.callbackTask.length()) {
                        return
                    }
                    if (that.freeVm.length > 0) {
                        const {vm} = that.freeVm.pop();
                        const {token, callback} = that.waitQueue.shift();
                        callback(vm, () => that.releaseVm(token, vm))
                    }
                    that.callbackTask = setTimeout(callbackTask, that.config.waitCheckCycle * 1000);
                }
                this.callbackTask = setTimeout(callbackTask, this.config.waitCheckCycle * 1000);
            }
        } else {
            console.log(`The current allocation of resources has reached the maximum limit, and the execution environment cannot be allocated: 
config: [vm max:${this.config.vmMax}, wait max: ${this.config.waitMax}];`)
            throw "The current allocation of resources has reached the maximum limit, and the execution environment cannot be allocated";
        }
    }
}

module.exports = VmManager;