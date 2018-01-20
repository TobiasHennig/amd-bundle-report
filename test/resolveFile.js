const assert = require('assert');
const resolveFile = require('../lib/resolveFile');

describe('#resolveFile', function() {
  it('should return the dependencies of a given file', async function() {
    const {dependencies} = await resolveFile('./test/fixture/bundle.js');
    assert.deepEqual([...dependencies], ['c', 'a', 'b']);
  });
});
