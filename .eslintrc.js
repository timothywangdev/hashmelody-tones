module.exports = {
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  extends: ['airbnb'],
  parser: 'babel-eslint',
  rules: {
    'no-restricted-syntax': 0,
    'max-classes-per-file': ['ignoreExpressions', true],
  },
};
