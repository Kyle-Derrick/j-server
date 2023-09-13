const BaseSupport = require('./BaseSupport.js')

module.exports = {
    handle(vmInstance, context) {
        BaseSupport.handleBase(vmInstance, context);
        BaseSupport.handleAsync(vmInstance, context);
    }
}