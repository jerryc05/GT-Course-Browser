const maxLen = 115

/** @type {import('eslint').Linter.Config} */
module.exports = {
  'env': {
    'browser': true,
    'es2022': true
  },
  'extends': 'eslint:all',
  'overrides': [],
  'parserOptions': {
    'ecmaVersion': 'latest'
  },
  'rules': {

    'indent': [
      'error',
      2
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'never'
    ],
    'array-element-newline': [
      'error',
      'consistent'
    ],
    'arrow-parens': [
      'error',
      'as-needed'
    ],
    'comma-dangle': [
      'error',
      'only-multiline'
    ],
    'curly': [
      'error',
      'multi'
    ],
    'dot-location': [
      'error',
      'property'
    ],
    'func-style': [
      'error',
      'declaration'
    ],
    'function-paren-newline': [
      'error',
      'consistent'
    ],
    'max-len': [
      'error',
      {
        'code': maxLen,
        'ignoreComments': true
      }
    ],
    'no-extra-parens': [
      'error',
      'all',
      {'nestedBinaryExpressions': false,
        'enforceForArrowConditionals': false}
    ],
    'no-multiple-empty-lines': [
      'error',
      {'max': 6}
    ],
    'no-warning-comments': 'warn',
    'padded-blocks': [
      'error',
      'never'
    ],
    'sort-imports': [
      'error',
      {'ignoreCase': true}
    ],
    'space-before-function-paren': [
      'error',
      'never'
    ],


    '@typescript-eslint/no-non-null-assertion': 'off',
    'capitalized-comments': 'off',
    'function-call-argument-newline': 'off',
    'id-length': 'off',
    'lines-between-class-members': 'off',
    'line-comment-position': 'off',
    'max-classes-per-file': 'off',
    'max-lines': 'off',
    'max-lines-per-function': 'off',
    'max-params': 'off',
    'max-statements': 'off',
    'multiline-comment-style': 'off',
    'multiline-ternary': 'off',
    'no-console': 'off',
    'no-continue': 'off',
    'no-inline-comments': 'off',
    'no-magic-numbers': 'off',
    'no-ternary': 'off',
    'object-curly-spacing': 'off',
    'one-var': 'off',
    'quote-props': 'off',
    'sort-keys': 'off',
    'sort-vars': 'off',
    'vue/max-attributes-per-line': 'off'
  }
}
