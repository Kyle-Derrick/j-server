#!/usr/bin/env node
const os = require("os");
const child_process = require("child_process");
const https = require("https");
const fs = require("fs");
const path = require("path");
const package_config = require("./package.json");

const config = {
    nodeDownload: `https://nodejs.org/download/release/${process.version}/`,
    projectName: 'js-engine',
    innerPath: 'resources',
    allowNpmEnv: new Set([
        // 'tmp', 'temp', 'os', 'username', 'hostname', 'home', 'homepath', 'lang', 'term', 'shell', 'pwd', 'oldpwd', 'user',
        'npm_config_metrics_registry', 'npm_config_proxy', 'npm_config_https_proxy'])
}
let platform = os.platform();
const arch = os.arch();
const isWin = platform === 'win32';
const suffix = isWin ? '.zip' : '.tar.xz';
if (isWin) {
    platform = 'win';
}
const nodeBaseFilename = `node-${process.version}-${platform}-${arch}`;
const nodeFilename = `${nodeBaseFilename}${suffix}`;
const downUrl = `${config.nodeDownload}${nodeFilename}`

const buildDir = 'build';
fs.mkdirSync(buildDir, {recursive: true});
// env fix
const env = {};
for (const envKey in process.env) {
    // if (config.allowNpmEnv.has(envKey)) {
    //     env[envKey] = process.env[envKey];
    // }
    if (envKey.toLowerCase().startsWith('npm_') && !config.allowNpmEnv.has(envKey)) {
        continue;
    }
    env[envKey] = process.env[envKey];
}

if (isWin) {
    pkgWin();
} else {
    child_process.execSync(`bash build.sh ${package_config.name} ${nodeFilename} ${package_config.version} ${downUrl}`, {stdio: 'inherit', env});
    return;
}

function pkgWin() {
    const nodeFilePath = path.join(buildDir, nodeFilename);
    if (fs.existsSync(nodeFilePath)) {
        console.log('already download node');
        pkg();
    } else {
        const nodeFileTmp = nodeFilePath + '.tmp';
        const writeStream = fs.createWriteStream(nodeFileTmp);
        console.log('start download node:');
        https.get(downUrl, res => {
            res.pipe(writeStream);
            const len = res.headers["content-length"] || 40000000;
            let downloadLen = 0;
            let lastProgress = 0;
            res.on('data', (chunk) => {
                downloadLen += chunk.length;
                const progress = (downloadLen * 100 / len).toFixed(0);
                if (progress > lastProgress) {
                    process.stdout.write(`\rdownloading: ${progress}%`);
                }
                lastProgress = progress;
            });
            res.on('end', () => {
                console.log('\ndownload over');
                writeStream.close();
                fs.renameSync(nodeFileTmp, nodeFilePath);
                pkg();
            });
            res.on('error', (err) => {
                console.log("\ndownload failed");
                writeStream.close();
            })
        })
    }
}
function pkg() {
    if (!fs.existsSync(path.join(buildDir, nodeBaseFilename))) {
        console.log('extract the node package...');
        let env_path;
        if (isWin) {
            child_process.execSync(`python ziputil.py -u ${nodeFilePath} ${buildDir}`, {stdio: 'inherit'})
            env_path = `${path.join(__dirname, buildDir, nodeBaseFilename)};${process.env.PATH}`;
        }
        env.PATH = env_path;
        console.log('node init...');
        child_process.execSync('npm install -g pm2', {stdio: 'inherit', env});
    }
    console.log('pkg...');
    const zipArgs = [];
    const innerPath = path.join(config.projectName, config.innerPath);
    zipArgs.push(`:${config.projectName}:${path.join(buildDir, nodeBaseFilename)}`);
    zipArgs.push(`:${path.join(innerPath, 'node_modules')}:node_modules`);
    zipArgs.push(`:${path.join(innerPath, 'core')}:core`);
    if (isWin) {
        zipArgs.push(`:${config.projectName}:bin`);
    } else {
        zipArgs.push(`:${path.join(config.projectName, 'bin')}:bin`);
    }
    zipArgs.push(`:${path.join(innerPath, 'App.js')}:App.js`);
    zipArgs.push(`:${path.join(innerPath, 'package.json')}:package.json`);
    zipArgs.push(`:${path.join(innerPath, 'package-lock.json')}:package-lock.json`);
    // zipArgs.push(`:${path.join(innerPath, 'LICENSE')}:LICENSE`);
    child_process.execSync(`python ziputil.py ${zipArgs.join(' ')} ${path.join(buildDir, config.projectName + '.zip')}`, {stdio: 'inherit'})

    console.log('pkg finished.');
}