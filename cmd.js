#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const readline = require('readline');
const path = require('path');

const opn = require('opn');

const configPath = expandTilde(process.env.FSGHUB_CONFIG_PATH || '~/.fsghubconfig');
const pathArg = process.argv[2] || '';

loadConfig(configPath)
  .catch(() => onboard(configPath).then(() => loadConfig(configPath)))
  .then(config => {
    const pathToOpen = expandTilde(path.join(process.cwd(), pathArg));
    for (let name in config) {
      const service = config[name];
      if (pathToOpen.indexOf(service.path) !== 0) continue;
      const components = pathToOpen.replace(service.path, '').split('/');
      while (!components[0]) components.shift();
      const url = `${service.url}/${components[0]}/${components[1] || ''}`;
      opn(url);
      process.exit(0);
    }
    console.log('Unable to find suitable url to open.');
    process.exit(1);
  })
  .catch(err => {
    console.log('Uncaught error thrown', err);
    process.exit(1);
  });

function onboard(_path) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  const githubUrl = 'https://github.com';
  let githubPath;
  return Promisify(rl, 'question', `Base path for service ${githubUrl}: (~/github) `)
    .then(answer => githubPath = expandTilde(answer || '~/github'))
    .then(() => Promisify(fs, 'stat', githubPath))
    .catch(() => {
      return Promisify(rl, 'question', `Directory does not exist, create? (yes) `)
        .then(shouldCreate => (shouldCreate || 'yes') === 'yes')
        .then(shouldCreate => shouldCreate && Promisify(fs, 'mkdir', githubPath));
    })
    .then(() => Promisify(fs, 'stat', githubPath))
    .then(stat => {
      if (!stat.isDirectory()) {
        console.log('Specified path already exists and is not a directory.');
        console.log('Aborting');
        process.exit(1);
      }
      return Promisify(fs, 'writeFile', _path, JSON.stringify({
        github: {
          url: githubUrl,
          path: githubPath
        }
      }));
    })
    .then(() => rl.close());
}

function loadConfig(_path) {
  return Promisify(fs, 'readFile', _path)
    .then(configString => JSON.parse(configString));
}

function Promisify(binding, fn, ...args) {
  return new Promise((rs, rj) => {
    if (typeof binding[fn] !== 'function') return rj(new Error('Invalid function name supplied'));
    args.push((err, res) => {
      if (err) rj(err);
      else rs(res);
    });
    binding[fn](...args);
  });
}

function expandTilde(_path) {
  return path.normalize(_path.replace('~', os.homedir()));
}
