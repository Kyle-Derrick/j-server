const {APP_CONTENT} = require('../constant/ConstVar.js');
const sharp = require('sharp');
const echarts = require('echarts');

const DEFAULT_WIDTH = 700;
const DEFAULT_HEIGHT = 600;

const DEFAULT_MAX_WIDTH = 3840;
const DEFAULT_MAX_HEIGHT = 2160;

const OPTION_EMPTY_ERROR = 400;
const ENV_CREATE_ERROR = 500;
const EVAL_RENDER_ERROR = 400;

function toImage(svgString, success, failed) {
    sharp(Buffer.from(svgString))
        .png()
        .toBuffer()
        .then(success)
        .catch(failed);
}

function render({
                    width = DEFAULT_WIDTH,
                    height = DEFAULT_HEIGHT,
                    option,
                    json = false,
                    timeout = APP_CONTENT.config.evalTimeout
                }, success, failed, translateImageFailed) {
    if (!option || !option.trim()) {
        failed("option cant be empty", OPTION_EMPTY_ERROR);
        return;
    }
    translateImageFailed = translateImageFailed || failed;
    width = Math.min(width, DEFAULT_MAX_WIDTH);
    height = Math.min(height, DEFAULT_MAX_HEIGHT);
    if (json) {
        try {
            let chart = echarts.init(null, null, {
                renderer: "svg",
                ssr: true,
                width: width,
                height: height
            })
            let optionJson = JSON.parse(option);
            chart.setOption(optionJson);
            toImage(chart.renderToSVGString(), success, failed, translateImageFailed);
            return;
        } catch (e) {
            console.debug(`try parse json failed：${option}`, e)
        }
    }
    const script = `\
(function() {
const chart = echarts.init(null, null, {
    renderer: "svg",
    ssr: true,
    width: ${width},
    height: ${height}
})
chart.setOption(${option});
return chart.renderToSVGString();
}())`;
    APP_CONTENT.vmManager.evalWithDefaultVm({
            param: {
                script,
                timeout
            },
            module: ['echarts'],
            success: svg => {
                toImage(svg, success, failed, translateImageFailed);
            },
            failed: err => {
                console.error("eval script error：", err);
                failed(`eval script error: ${err.message}`, EVAL_RENDER_ERROR);
            },
            envFailed: err => {
                console.error("create env context failed：", err);
                failed("create env context failed", ENV_CREATE_ERROR);
            }
        })
}

module.exports = {
    render
}