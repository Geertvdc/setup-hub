import * as core from '@actions/core';
import * as installer from './installer';
import * as path from 'path';

async function run() {
  try {
    let version = core.getInput('version');
    await installer.getHub(version);

    const matchersPath = path.join(__dirname, '..', '.github');
    console.log(`##[add-matcher]${path.join(matchersPath, 'hub.json')}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
