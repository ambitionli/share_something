import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { enUS } from './en-US';
import type { TranslationResources } from './zh-CN';
import { zhCN } from './zh-CN';

export type { TranslationResources } from './zh-CN';
export { enUS } from './en-US';
export { zhCN } from './zh-CN';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: TranslationResources;
    };
  }
}

const defaultNS = 'translation' as const;

void i18n.use(initReactI18next).init({
  lng: 'zh-CN',
  fallbackLng: 'zh-CN',
  supportedLngs: ['zh-CN', 'en-US'],
  defaultNS,
  ns: [defaultNS],
  resources: {
    'zh-CN': { [defaultNS]: zhCN },
    'en-US': { [defaultNS]: enUS },
  },
  interpolation: {
    escapeValue: false,
  },
});

export function initI18n(): typeof i18n {
  return i18n;
}

export default i18n;
