/** @type {import('stylelint').Config} */
export default {
  extends: [
    'stylelint-config-standard-scss',
    'stylelint-config-recommended-vue/scss',
    'stylelint-config-prettier-scss'
  ],
  rules: {
    'scss/at-extend-no-missing-placeholder': null,
    'scss/at-mixin-argumentless-call-parentheses': 'always'
  }
}
