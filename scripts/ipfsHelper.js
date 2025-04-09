const fs = require('fs').promises;
const path = require('path');
const config = require('config');

// https://stackoverflow.com/questions/36856232/write-add-data-in-json-file-using-node-js
// Accepts json data and stores in specified filePath.
// If the file does not exists in specified location, it creates it
const lockfile = require('proper-lockfile');

const storeDataToFile = async (jsonData) => {
  const filePath = path.join(__dirname, config.get('ipfsFile.location'));
  let release;

  try {
    // Acquire lock (wait if another process is writing)
    release = await lockfile.lock(filePath, { retries: 3 });
    
    let json = [];
    try {
      const data = await fs.readFile(filePath, 'utf8');
      json = JSON.parse(data);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }

    json.push(jsonData);
    await fs.writeFile(filePath, JSON.stringify(json));
  } finally {
    if (release) await release(); // Release lock
  }
};

async function fileExists(path) {
  try {
    const res = await fs.access(path);
    return true;
  } catch (err) {
    // no such file or directory. File really does not exist
    if (err.code == 'ENOENT') {
      return false;
    }
    console.log('Exception fs.statSync (' + path + '): ' + err);
    // some other exception occurred
    throw err;
  }
}

module.exports = {
  storeDataToFile,
  fileExists,
};
