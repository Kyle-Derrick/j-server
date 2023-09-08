// const express = require('express');
// const expressWs = require('express-ws');
//
// let app = express();
// expressWs(app);
//
//
//
//
//
//
//
//
//
//
//
//

// Create a new isolate limited to 128MB
import ivm from 'isolated-vm';
const isolate = new ivm.Isolate({ memoryLimit: 128 });

// Create a new context within this isolate. Each context has its own copy of all the builtin
// Objects. So for instance if one context does Object.prototype.foo = 1 this would not affect any
// other contexts.
const context = isolate.createContextSync();
const context2 = isolate.createContextSync();
const context3 = isolate.createContextSync();

// Get a Reference{} to the global object within the context.
const jail = context.global;

// This makes the global object available in the context as `global`. We use `derefInto()` here
// because otherwise `global` would actually be a Reference{} object in the new isolate.
jail.setSync('global', jail.derefInto());

// We will create a basic `log` function for the new isolate to use.
jail.setSync('log', function(...args) {
    console.log(...args);
});


const jail2 = context2.global;

// This makes the global object available in the context as `global`. We use `derefInto()` here
// because otherwise `global` would actually be a Reference{} object in the new isolate.
jail2.setSync('global', jail.derefInto());

// We will create a basic `log` function for the new isolate to use.
jail2.setSync('log', function(...args) {
    console.log(...args);
});
const jail3 = context3.global;

// This makes the global object available in the context as `global`. We use `derefInto()` here
// because otherwise `global` would actually be a Reference{} object in the new isolate.
jail3.setSync('global', jail.derefInto());

// We will create a basic `log` function for the new isolate to use.
jail3.setSync('log', function(...args) {
    console.log(...args);
});

// And let's test it out:
context.evalSync('log("hello world")');
// > hello world


let script = `
{
	const twoMegabytes = 1024 * 1024 * 2;
    const array = new Uint8Array(twoMegabytes);
    for (let ii = 0; ii < twoMegabytes; ii += 4096) {
        array[ii] = 1; // we have to put something in the array to flush to real memory
    }
    data[\`array\${Math.random()}\`] = array
    data.push(array);
    log('I\\'3 ve wasted '+ (data.length * 2)+ 'MB');
    }
`;
// Let's see what happens when we try to blow the isolate's memory
const hostile = isolate.compileScriptSync(script);
const hostile2 = isolate.compileScriptSync(script);
const hostile3 = isolate.compileScriptSync(script);
context.evalSync("let data = []");
context2.evalSync("let data = []");
context3.evalSync("let data = []");
// Using the async version of `run` so that calls to `log` will get to the main node isolate
while (true) {
    await hostile.run(context)
    await hostile2.run(context2)
    await hostile3.run(context3)
}
// I've wasted 2MB
// I've wasted 4MB
// ...
// I've wasted 130MB
// I've wasted 132MB
// RangeError: Array buffer allocation failed