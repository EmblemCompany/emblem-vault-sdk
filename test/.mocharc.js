module.exports = {
  require: 'ts-node/register',
  extension: ['.ts'],
  spec: './test/**/*.spec.ts',
  timeout: 30000, // 30 seconds, matching the Jest timeout
  exit: true,
  recursive: true
};
