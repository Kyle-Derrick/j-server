import {dirname, join} from "path";
import VmManager from "../support/vm/VmManager.js";
import vmManager from "../support/vm/VmManager.js";

const __dirname = dirname(new URL(import.meta.url).pathname)

class AppContent {
    config;
    vmManager;
}

export const DEFAULT_HOST = "127.0.0.1";
export const DEFAULT_PORT = 8567;
export const DEFAULT_MEM_MAX = 0;
export const DEFAULT_VM_MEM = 128;
export const DEFAULT_VM_MAX = 0;
// int32 max
export const DEFAULT_WAIT_MAX = 2147483647;
export const DEFAULT_WAIT_CHECK_CYCLE = 1;
export const DEFAULT_RECOVERY_FREE_MAX_TIME = 60;
export const DEFAULT_FORCED_RECYCLING_TIME = 60 * 3;
export const DEFAULT_EVAL_TIMEOUT = 5 * 60;
export const DEFAULT_CONFIG_PATH = join(dirname(__dirname), "config/application.yml").toString();
export const DEFAULT_LIB_PATH = join(dirname(__dirname), "runtime_lib");
export const APP_CONTENT = new AppContent();
