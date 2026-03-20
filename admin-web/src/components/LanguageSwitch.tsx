import { Button } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitch() {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh-CN';

  return (
    <Button
      type="text"
      icon={<GlobalOutlined />}
      onClick={() => i18n.changeLanguage(isZh ? 'en-US' : 'zh-CN')}
    >
      {isZh ? 'EN' : '中文'}
    </Button>
  );
}
