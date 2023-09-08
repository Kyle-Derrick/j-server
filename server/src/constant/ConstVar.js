import {dirname, join} from "path";

const __dirname = dirname(new URL(import.meta.url).pathname)

export const DEFAULT_HOST = "127.0.0.1";
export const DEFAULT_PORT = 8567;
export const DEFAULT_MEM_MAX = 0;
export const DEFAULT_VM_MEM = 128;
export const DEFAULT_VM_MAX = 0;
export const DEFAULT_CONFIG_PATH = join(dirname(__dirname), "config/application.yml").toString();
export const DEFAULT_LIB_PATH = join(dirname(__dirname), "runtime_lib");
