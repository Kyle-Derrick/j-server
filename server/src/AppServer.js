import yml from "yamljs";
import fs from "fs";
import express from "express";
import expressWs from "express-ws";
import {DEFAULT_CONFIG_PATH} from "./constant/ConstVar.js";
import AppConfig from "./model/AppConfig.js";

class AppServer {
    config;
    constructor(option) {
        let configPath = DEFAULT_CONFIG_PATH;
        let config = new AppConfig();
        try {
            let ymlConfig;
            if (option && option.config) {
                configPath = option.config;
            }
            fs.access(configPath, fs.constants.F_OK, err => {
                if (err) {
                    // 如果出错，说明文件不存在
                    console.warn(`config yaml file not exists: ${configPath}`);
                } else {
                    ymlConfig = yml.load(configPath);
                    Object.assign(ymlConfig, config);
                }
            })
        } catch (e) {
            console.error(`parse app config error: ${configPath}`)
            throw e;
        }
        config.init();
        this.config = config;
    }

    start() {
        let app = express();
        expressWs(app);
    }
}

export default AppServer;