const path = require('path')
const fs = require("fs");
const root_path=path.dirname(__dirname);
const app_path=path.join(root_path, 'resources');
const log_path=path.join(root_path, 'logs');
const out_file=path.join(log_path, 'out.log');
const error_file=path.join(log_path, 'error.log');
const app_config_path=path.join(root_path, 'config', 'application.yml');
fs.mkdirSync(log_path, {recursive: true});
module.exports = {
  apps : [{
    name: 'j-server',
    script: 'App.js',
    cwd: app_path,
    instances: 0,
    error_file,
    out_file,
    log_date_format:"YYYY-MM-DD HH:mm Z",

    args: `-c ${app_config_path}`,
    // watch: '.'
  }],

  // deploy : {
  //   production : {
  //     user : 'admin',
  //     host : '127.0.0.1',
  //     ref  : 'origin/master',
  //     repo : 'GIT_REPOSITORY',
  //     path : 'DESTINATION_PATH',
  //     'pre-deploy-local': '',
  //     'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
  //     'pre-setup': ''
  //   }
  // }
};
