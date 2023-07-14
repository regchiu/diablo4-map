import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import zhTW from './locales/zh-TW.json'

export const locales = [
  {
    label: 'English',
    value: 'en'
  },
  {
    label: '繁體中文',
    value: 'zh-TW'
  }
] as const

export const i18n = createI18n({
  legacy: false,
  locale: 'zh-TW',
  fallbackLocale: 'en',
  messages: {
    en,
    'zh-TW': zhTW
  }
})
