import { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Spin } from 'antd';
import { ShopOutlined, ShoppingCartOutlined, UserOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';

interface Stats {
  total_orders: number;
  total_products: number;
  total_users: number;
  revenue: string;
}

export default function Dashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Stats>('/api/v1/admin/stats')
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;
  }

  return (
    <div>
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title={t('dashboard.totalOrders')} value={stats?.total_orders ?? 0} prefix={<ShoppingCartOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title={t('dashboard.totalProducts')} value={stats?.total_products ?? 0} prefix={<ShopOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title={t('dashboard.totalUsers')} value={stats?.total_users ?? 0} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title={t('dashboard.revenue')} value={stats?.revenue ?? '0'} prefix="¥" precision={2} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
