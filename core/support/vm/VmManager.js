const ivm = require('isolated-vm');
const fs = require('fs');
const AppConfig = require('../../model/AppConfig.js');
const VmInstance = require('../../model/VmInstance');
const vmSupport = require('./init/SupportAll');
const path = require("path");
const {APP_CONTENT} = require("../../constant/ConstVar");

const CURRENT_PATH_PREFIX = './';
const BASE_PATH_PREFIX = '../';
const DEFAULT_MODULE_SUFFIX = '.js';

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

function instantiateModule(vmInstance, module, context) {
    const needRelease = [];
    module.forEach(moduleName => {
        const moduleImport = APP_CONTENT.config.module[moduleName];
        if (moduleImport) {
            const module = vmInstance.vm.compileModuleSync(moduleImport);
            const rootPath = path.basename(module.dependencySpecifiers[0]);
            module.instantiateSync(context, m => {
                const relative = m.startsWith(CURRENT_PATH_PREFIX) || m.startsWith(BASE_PATH_PREFIX);
                // if (relative && !path.extname(m)) {
                //     m += DEFAULT_MODULE_SUFFIX;
                // }
                if (!m.startsWith(rootPath) && relative) {
                    m = path.join(rootPath, m);
                }
                const depend = vmInstance.vm.compileModuleSync(fs.readFileSync(require.resolve(m)).toString())
                needRelease.push(depend);
                return depend;
            });
            needRelease.push(module);
            module.evaluateSync();
        } else {
            console.warn(`load module failed ${moduleName}`);
        }
    });
    context.release = function () {
        needRelease.forEach(module => module.release());
        context.release();
    }
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
        const script = [];
        // todo have some question
        // config.script.forEach(s => {
        //     defaultVm.compileScriptSync(fs.readFileSync(s).toString());
        // })
        const module = {};
        // todo have some question
        // for (let key in config.module) {
        //     module[key] = defaultVm.compileModuleSync(config.module[key]);
        // }
        this.defaultVm = new VmInstance({
            vm: defaultVm,
            module,
            script
        });

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

    evalWithDefaultVm({param, module = [], init, success, failed, envFailed}) {
        let {
            timeout = this.config.evalTimeout,
            script
        } = param;
        this.defaultVm.vm
            .createContext()
            .then(context => {
                vmSupport.handle(this.defaultVm, context);
                instantiateModule(this.defaultVm, module, context);
                if (init) {
                    init(context, this.defaultVm);
                }
                timeout = Math.min(timeout, this.config.evalTimeout) * 1000;
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