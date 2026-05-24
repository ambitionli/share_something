# admin-web 国际化（i18next）

> 最后更新：2026-05-24（`autonomy.*` 扩展：自动驾驶 WebViz 回放文案与可见传感器标签）

## 说明

- 资源目录：`admin-web/src/i18n/`
  - `zh-CN.ts`：简体中文文案 + `TranslationResources` 接口定义
  - `en-US.ts`：英文文案（实现同一接口）
  - `index.ts`：i18next + `react-i18next` 初始化（默认语言 `zh-CN`），并扩展 `i18next` 的 `CustomTypeOptions` 以便 `t()` 有类型提示
- 入口：`admin-web/src/main.tsx` 中 `import './i18n'` 在应用启动前完成初始化

## 使用

```tsx
import { useTranslation } from 'react-i18next';

function Example() {
  const { t } = useTranslation();
  return <span>{t('common.appName')}</span>;
}
```

切换语言：`i18n.changeLanguage('en-US')`（从 `admin-web/src/i18n` 导入默认导出的 `i18n`）。

## 修改记录

- 2026-05-24：补充相机名、障碍物标签和相机数量后缀文案；更新时间戳：2026-05-24 06:49 UTC。
- 2026-05-24：新增 `autonomy.*` 中英文文案；更新时间戳：2026-05-24 06:43 UTC。
