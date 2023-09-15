class VmInstance{
    vm;
    module = {};
    script = [];

    constructor(vmInstance) {
        Object.assign(this, vmInstance);
    }
}

module.exports = VmInstance;