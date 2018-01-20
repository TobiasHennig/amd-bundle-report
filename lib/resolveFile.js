const acorn = require('acorn');
const fs = require('fs');
const {promisify} = require('util');
const walk = require('acorn/dist/walk');

const readFileAsync = promisify(fs.readFile);

function isDefineStatement(expression) {
  return (
    expression.callee &&
    expression.callee.name &&
    expression.callee.name === 'define'
  );
}

function hasDependencyName(expression) {
  return (
    expression.arguments &&
    expression.arguments.length &&
    expression.arguments[0].value &&
    typeof expression.arguments[0].value === 'string'
  );
}

function getDependencyName(expression) {
  return expression.arguments[0].value;
}

module.exports = async function(path) {
  const code = await readFileAsync(path);
  const ast = acorn.parse(code);
  const dependencies = new Set();

  walk.simple(ast, {
    CallExpression(node) {
      if (isDefineStatement(node) && hasDependencyName(node)) {
        dependencies.add(getDependencyName(node));
      }
    }
  });

  return {
    dependencies,
  }
};
