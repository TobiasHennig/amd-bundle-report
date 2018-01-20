const assert = require('assert');
const stripAnsi = require('strip-ansi');
const {combine, filter, reportFile, reportFiles} = require('../lib/reporter');

describe('reporter', function() {
  describe('#combine', function() {
    it('should combine multiple reports', async function() {
      const reports = new Set([{name: 'bundleA', dependencies: new Set(['a', 'b'])}, {name: 'bundleB', dependencies: new Set(['a', 'e'])}])
      const combinedReports = new Map([['a', ['bundleA', 'bundleB']], ['b', ['bundleA']], ['e', ['bundleB']]]);
      assert.deepEqual(combine(reports), combinedReports);
    });
    it('should filter doubles', async function() {
      const combinedReports = new Map([['a', ['bundleA', 'bundleB']], ['b', ['bundleA']], ['e', ['bundleB']]]);
      const filteredReports = new Map([['a', ['bundleA', 'bundleB']]]);
      assert.deepEqual(filter(combinedReports), filteredReports);
    });
    it('should report a warning if file size is over the budget', async function() {
      const path = './test/fixture/bundle.js';
      const {message} = await reportFile(path, {limit: 50});
      assert.equal(stripAnsi(message), 'bundle.js (99 B|150 B) [3 Dep]\nWARNING: bundle.js exceeds the recommended limit (50 B)');
    });
  });
  describe('#reportFile', function() {
    it('should return a report message', async function() {
      const path = './test/fixture/bundle.js';
      const {message} = await reportFile(path);
      assert.equal(stripAnsi(message), 'bundle.js (99 B|150 B) [3 Dep]');
    });
    it('should report a warning if file size is over the budget', async function() {
      const path = './test/fixture/bundle.js';
      const {message} = await reportFile(path, {limit: 50});
      assert.equal(stripAnsi(message), 'bundle.js (99 B|150 B) [3 Dep]\nWARNING: bundle.js exceeds the recommended limit (50 B)');
    });
  });
  describe('#reportFiles', function() {
    it('should return multiple report messages', async function() {
      const paths = ['./test/fixture/bundle.js', './test/fixture/anotherBundle.js'];
      const {message} = await reportFiles(paths);
      assert.equal(stripAnsi(message), 'anotherBundle.js (65 B|46 B) [1 Dep]\nbundle.js (99 B|150 B) [3 Dep]');
    });
    it('should report a warning if duplicated dependencies found', async function() {
      const paths = ['./test/fixture/bundle.js', './test/fixture/anotherBundle.js', './test/fixture/yetAnotherBundle.js'];
      const {message} = await reportFiles(paths);
      assert.equal(stripAnsi(message), 'anotherBundle.js (65 B|46 B) [1 Dep]\nbundle.js (99 B|150 B) [3 Dep]\nyetAnotherBundle.js (82 B|94 B) [2 Dep]\n\nWARNING: Redundant dependencies found\na [bundle.js, yetAnotherBundle.js]');
    });
  });
});
