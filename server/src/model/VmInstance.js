class VmInstance{
    vm;
    module = {};
    script = [];

    constructor(vmInstance) {
        Object.assign(vmInstance, this);
    }
}

module.exports = VmInstance;