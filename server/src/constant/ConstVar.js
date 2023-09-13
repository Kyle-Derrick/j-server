const {dirname, join} = require('path');

class AppContent {
    config;
    vmManager;
}

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 8567;
const DEFAULT_MEM_MAX = 0;
const DEFAULT_VM_MEM = 128;
const DEFAULT_VM_MAX = 0;
// int32 max
const DEFAULT_WAIT_MAX = 2147483647;
const DEFAULT_WAIT_CHECK_CYCLE = 1;
const DEFAULT_RECOVERY_FREE_MAX_TIME = 60;
const DEFAULT_FORCED_RECYCLING_TIME = 60 * 3;
const DEFAULT_EVAL_TIMEOUT = 3 * 60;
const DEFAULT_CONFIG_PATH = join(dirname(__dirname), "config/application.yml").toString();
const DEFAULT_LIB_PATH = join(dirname(__dirname), "runtime_lib");
const APP_CONTENT = new AppContent();
const DEFAULT_MODULE = {
    // echarts: "echarts"
};

module.exports = {
    DEFAULT_HOST,
    DEFAULT_PORT,
    DEFAULT_MEM_MAX,
    DEFAULT_VM_MEM,
    DEFAULT_VM_MAX,
    DEFAULT_WAIT_MAX,
    DEFAULT_WAIT_CHECK_CYCLE,
    DEFAULT_RECOVERY_FREE_MAX_TIME,
    DEFAULT_FORCED_RECYCLING_TIME,
    DEFAULT_EVAL_TIMEOUT,
    DEFAULT_CONFIG_PATH,
    DEFAULT_LIB_PATH,
    APP_CONTENT,
    DEFAULT_MODULE,
}