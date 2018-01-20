const assert = require('assert');
const fileSize = require('../lib/fileSize.js');

describe('#fileSize()', function() {
  it('should return the file size of a given file', async function() {
    const {size} = await fileSize('./test/fixture/bundle.js');
    assert.equal(size, 150);
  });
  it('should return the gzipped file size of a given file', async function() {
    const {sizeGzip} = await fileSize('./test/fixture/bundle.js');
    assert.equal(sizeGzip, 99);
  });
});