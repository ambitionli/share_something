import { Card, Col, Row, Statistic } from 'antd';
import { ShopOutlined, ShoppingCartOutlined, UserOutlined, DollarOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const { t } = useTranslation();

  return (
    <div>
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title={t('dashboard.totalOrders')} value={0} prefix={<ShoppingCartOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title={t('dashboard.totalProducts')} value={0} prefix={<ShopOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title={t('dashboard.totalUsers')} value={0} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title={t('dashboard.revenue')} value={0} prefix={<DollarOutlined />} precision={2} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
