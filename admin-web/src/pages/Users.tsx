import { Card, Table, Tag } from 'antd';
import { useTranslation } from 'react-i18next';

export default function Users() {
  const { t } = useTranslation();

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: t('users.phone'), dataIndex: 'phone' },
    { title: t('users.nickname'), dataIndex: 'nickname' },
    {
      title: t('users.role'),
      dataIndex: 'role',
      render: (role: string) => role === 'admin'
        ? <Tag color="red">{t('users.admin')}</Tag>
        : <Tag color="blue">{t('users.buyer')}</Tag>,
    },
    { title: t('users.registrationTime'), dataIndex: 'created_at', render: (v: string) => v ? new Date(v).toLocaleString() : '-' },
  ];

  return (
    <Card>
      <h2>{t('users.role') === '角色' ? '用户管理' : 'User Management'}</h2>
      <Table rowKey="id" columns={columns} dataSource={[]} pagination={{ pageSize: 10 }} />
    </Card>
  );
}
