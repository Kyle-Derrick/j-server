const yml = require('yamljs');
const fs = require('fs');
const express = require('express');
const expressWs = require('express-ws');
const {APP_CONTENT, DEFAULT_CONFIG_PATH} = require('./constant/ConstVar.js');
const AppConfig = require('./model/AppConfig.js');
const requestMapping = require("./controller/requestMapping.js");
const VmManager = require('./support/vm/VmManager.js');

const SUFFIX = "Controller";

function controllerNameToRootPath(controllerName) {
    if (controllerName.endsWith(SUFFIX)) {
        return controllerName.substring(0, controllerName.length - SUFFIX.length);
    }
    return controllerName;
}

class AppServer {
    config;
    app;
    server;
    constructor(option) {
        let configPath = DEFAULT_CONFIG_PATH;
        let config = new AppConfig();
        try {
            let ymlConfig;
            if (option && option.config) {
                configPath = option.config;
            }
            fs.accessSync(configPath, fs.constants.R_OK);
            ymlConfig = yml.load(configPath);
            Object.assign(config, ymlConfig);
        } catch (e) {
            console.error(`parse app config error: ${configPath}, err: ${e.message}`)
            throw e;
        }
        config.init();
        this.config = config;

        APP_CONTENT.config = config;
        APP_CONTENT.vmManager = new VmManager(config);
    }

    start() {
        const app = express();
        expressWs(app);
        app.use(express.json())
        this.app = app;
        this.setRequestMapping();
        const server = app.listen(this.config.port, this.config.host, function () {
            console.log("server started: http://%s:%s", server.address().address, server.address().port)
        });
        this.server = server;
    }

    setRequestMapping() {
        for (let controllerName in requestMapping) {
            const controller = requestMapping[controllerName];
            let rootPath = controllerNameToRootPath(controllerName);
            for (let name in controller) {
                const func = controller[name];
                if (!(typeof func === "function")) {
                    continue;
                }
                this.app.post(`/${rootPath}/${name}`, func);
            }
        }
    }
}

module.exports = AppServer;