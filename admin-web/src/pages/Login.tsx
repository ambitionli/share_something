import { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { PhoneOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/auth';
import LanguageSwitch from '../components/LanguageSwitch';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const onFinish = async (values: { phone: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.phone, values.password);
      message.success(t('auth.login') + (t('auth.login') === '登录' ? '成功' : ' successful'));
      navigate('/');
    } catch {
      message.error(t('messages.operationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Card style={{ width: 400, borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Typography.Title level={2} style={{ margin: 0 }}>{t('common.appName')}</Typography.Title>
          <Typography.Text type="secondary">
            {t('auth.login') === '登录' ? '管理后台' : 'Admin Panel'}
          </Typography.Text>
          <div style={{ marginTop: 8 }}><LanguageSwitch /></div>
        </div>
        <Form onFinish={onFinish} size="large">
          <Form.Item name="phone" rules={[{ required: true, message: t('auth.phone') }]}>
            <Input prefix={<PhoneOutlined />} placeholder={t('auth.phone')} />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: t('auth.password') }]}>
            <Input.Password prefix={<LockOutlined />} placeholder={t('auth.password')} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              {t('auth.login')}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
