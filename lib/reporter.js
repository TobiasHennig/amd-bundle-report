const chalk = require('chalk');
const fileSize = require('./fileSize');
const prettyBytes = require('pretty-bytes');
const resolveFile = require('./resolveFile');

function combine(reports) {
  return [...reports].reduce((prev, curr) => {
    [...curr.dependencies].forEach((dependency) => {
      const newValue = prev.has(dependency) ? [...prev.get(dependency), curr.name] : [curr.name];
      prev.set(dependency, newValue);
    });
    return prev;
  }, new Map());
}

function filter(reports) {
  return new Map([...reports].sort(([a], [b]) => {
    return (a < b) ? -1 : (a > b) ? 1 : 0;
  }).filter((report) => {
    return (report[1].length > 1);
  }));
}

async function reportFile (path, {limit} = {}) {
  const name = path.split('/').pop();
  const {size, sizeGzip} = await fileSize(path);
  const {dependencies} = await resolveFile(path);
  const messages = [`${name} (${prettyBytes(sizeGzip)}|${chalk.dim(prettyBytes(size))}) ${chalk.blue(`[${dependencies.size} Dep]`)}`];

  if (limit && sizeGzip > limit) {
    messages.push(chalk.yellow(`WARNING: ${name} exceeds the recommended limit (${prettyBytes(limit)})`));
  }

  return {
    name,
    size,
    sizeGzip,
    dependencies,
    message: messages.join("\n")
  };
}

async function reportFiles (paths, options = {}) {
  const reports = new Set(await Promise.all(paths.map(async (path) => {
    return await reportFile(path, options);
  })));

  let message = [...reports]
    .map(({message}) => message)
    .sort()
    .join("\n");

  const doubles = filter(combine(reports));
  if (doubles.size) {
    message += `\n\n${chalk.yellow(`WARNING: Redundant dependencies found (${doubles.size})`)}`;
    message += [...doubles].reduce((prev, [name, dependencies]) => {
      prev += `\n${name} ${chalk.blue(`[${dependencies.join(', ')}]`)}`;
      return prev;
    }, '');
  }

  return {
    reports,
    message
  }
}

module.exports = {
  combine,
  filter,
  reportFile,
  reportFiles,
};
