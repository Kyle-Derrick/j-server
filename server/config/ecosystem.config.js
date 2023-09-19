const resources_path = 'resources';
const path = require('path')
const root_path=path.dirname(__dirname);
const app_path=path.join(root_path, resources_path);
const log_path=path.join(root_path, 'logs');
const out_file=path.join(log_path, 'out.log');
const error_file=path.join(log_path, 'error.log');
module.exports = {
  apps : [{
    name: 'js-engine',
    script: 'App.js',
    cwd: app_path,
    instances: 1,
    error_file,
    out_file,
    log_date_format:"YYYY-MM-DD HH:mm Z",
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
