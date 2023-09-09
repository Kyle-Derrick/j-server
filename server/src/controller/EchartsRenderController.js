import {APP_CONTENT} from "../constant/ConstVar.js";

export default {
    // eval(req, res) {
    //     const param = req.body;
    //     APP_CONTENT.vmManager.getDefaultVm()
    //         .createContext()
    //         .then(context => {
    //             return context.eval(param.script, {timeout: APP_CONTENT.config.evalTimeout})
    //                 .then(result => {
    //                     res.send(result);
    //                 }).catch(err => {
    //                     console.error("执行脚本报错：", err);
    //                     res.status(400).send("执行代码处出错");
    //                 }).finally(() => context.release())
    //         }).catch(err => {
    //             console.error("无法创建执行脚本上下文环境：", err);
    //             res.status(500).send("无法创建环境");
    //         });
    // },
}