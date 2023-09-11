import {APP_CONTENT} from "../constant/ConstVar.js";

export default {
    eval(req, res) {
        const param = req.body;
        APP_CONTENT.vmManager.evalWithDefaultVm(param, null,
                result => {
                            res.status(200).send(JSON.stringify(result));
                        },
                err => {
                            console.error("执行脚本报错：", err);
                            res.status(400).send(`执行代码处出错${err.message}`);
                        },
                err => {
                            console.error("无法创建执行脚本上下文环境：", err);
                            res.status(500).send("无法创建环境");
                        })
    },
}