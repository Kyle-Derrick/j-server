function handleBase(vmInstance, context) {
    const jail = context.global;
    jail.setSync("global", jail.derefInto());
    jail.setSync("log", (...args) => {
        console.log('vm out: ', ...args);
    });
    jail.setSync("error", (...args) => {
        console.error('vm out: ', ...args);
    });
    jail.setSync("warn", (...args) => {
        console.warn('vm out: ', ...args);
    });
    jail.setSync("debug", (...args) => {
        console.debug('vm out: ', ...args);
    });
    context.evalSync(`(${
        () => {
            function handleArgs(...args) {
                return args.map(i => i.toString())
            }
            global.console = {
                log(...args) {
                    log(...handleArgs(args));
                },
                error(...args) {
                    error(...handleArgs(args));
                },
                warn(...args) {
                    warn(...handleArgs(args));
                },
                debug(...args) {
                    debug(...handleArgs(args));
                }
            }
        }
    })()`);
}
function handleAsync(vmInstance, context) {
    context.evalSync(`(${
        () => {
            function handleArgs(...args) {
                return args.map(i => i.toString())
            }
            global.__async_func_pool = {
                pool: new Map(),
                nextId: 1
            };
            const pushAsyncFuncPool = (cycle = false) => {
                return (func, delay = 0, ...args) => {
                    if (typeof func === 'string') {
                        func = eval(func);
                    }
                    const context = {
                        func,
                        delay,
                        args,
                        cycle,
                        lastExecTime: Date.now()
                    };
                    let id = global.__async_func_pool.nextId++;
                    global.__async_func_pool.pool.set(id, context);
                    if (cycle) {
                        console.warn('create a cycle async func');
                    } else {
                        console.warn(`create a async func, delay: ${delay}`);
                    }
                    return id;
                };
            }
            global.setTimeout = pushAsyncFuncPool(false);
            global.setInterval = pushAsyncFuncPool(true);
            global.clearTimeout = (id) => global.__async_func_pool.pool.delete(id);
            global.clearInterval = global.clearTimeout;
            global.__run_async_func = () => {
                const pool = global.__async_func_pool.pool;
                while (pool.size > 0) {
                    const [id, context] = pool.entries().next().value;
                    const now = Date.now();
                    if (context.lastExecTime - now >= context.delay) {
                        pool.delete(id);
                        try {
                            context.func(...context.args);
                        } catch (e) {
                            console.error('async func execute failed: ', e);
                        }
                        context.lastExecTime = now;
                        if (context.cycle) {
                            pool.set(id, context);
                        }
                    }
                }
            }
        }
    })()`);

    context.evalSync = script => {
        context.evalSync(`(() => {
        const result = ${script};
        __run_async_func();
        return result;
        })()`);
    }
}

module.exports = {
    handleBase,
    handleAsync
}