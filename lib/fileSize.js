const fs = require('fs');
const gzipSize = require('gzip-size');
const {promisify} = require('util');

const statAsync = promisify(fs.stat);

module.exports = async function(path) {
  const {size} = await statAsync(path);
  const sizeGzip = await gzipSize.file(path);

  return {
    size,
    sizeGzip,
  };
}
