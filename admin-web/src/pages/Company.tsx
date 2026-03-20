import { useEffect, useState } from 'react';
import { Tabs, Form, Input, Button, Card, Table, Tag, Modal, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import * as companyApi from '../services/company';
import type { NewsItem } from '../services/company';

function CompanyInfoTab() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    companyApi.getCompanyInfo().then((info) => {
      if (info) {
        form.setFieldsValue(info);
      }
    });
  }, []);

  const onSave = async () => {
    const values = await form.validateFields();
    setLoading(true);
    try {
      await companyApi.updateCompanyInfo({ ...values, photos: values.photos || [] });
      message.success(t('messages.updateSuccess'));
    } catch {
      message.error(t('messages.operationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Form form={form} layout="vertical" style={{ maxWidth: 600 }}>
        <Form.Item name="title" label={t('company.title')} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label={t('company.description')}>
          <Input.TextArea rows={6} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={onSave} loading={loading}>{t('common.actions.save')}</Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

function NewsTab() {
  const { t } = useTranslation();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [form] = Form.useForm();

  const fetchNews = async (p = 1) => {
    setLoading(true);
    try {
      const res = await companyApi.listNews({ page: p, page_size: 10, published_only: false });
      setNews(res.items);
      setTotal(res.total);
      setPage(p);
    } catch {
      message.error(t('messages.operationFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNews(); }, []);

  const openModal = (record?: NewsItem) => {
    setEditing(record || null);
    form.resetFields();
    if (record) {
      form.setFieldsValue(record);
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    try {
      if (editing) {
        await companyApi.updateNews(editing.id, values);
        message.success(t('messages.updateSuccess'));
      } else {
        await companyApi.createNews(values);
        message.success(t('messages.createSuccess'));
      }
      setModalOpen(false);
      fetchNews(page);
    } catch {
      message.error(t('messages.operationFailed'));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await companyApi.deleteNews(id);
      message.success(t('messages.deleteSuccess'));
      fetchNews(page);
    } catch {
      message.error(t('messages.operationFailed'));
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: t('company.title'), dataIndex: 'title' },
    {
      title: t('orders.status'),
      dataIndex: 'is_published',
      width: 100,
      render: (v: boolean) => v
        ? <Tag color="green">{t('company.publish')}</Tag>
        : <Tag color="default">{t('company.draft')}</Tag>,
    },
    { title: t('users.registrationTime'), dataIndex: 'created_at', width: 180, render: (v: string) => new Date(v).toLocaleString() },
    {
      title: t('common.actions.edit'),
      width: 150,
      render: (_: unknown, record: NewsItem) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openModal(record)} />
          <Popconfirm title={t('messages.confirmDelete')} onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
          {t('common.actions.add')}
        </Button>
      </div>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={news}
        loading={loading}
        pagination={{ current: page, total, pageSize: 10, onChange: fetchNews }}
      />
      <Modal
        title={editing ? t('common.actions.edit') : t('common.actions.add')}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        width={600}
        okText={t('common.actions.save')}
        cancelText={t('common.actions.cancel')}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label={t('company.title')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="content" label={t('company.description')}>
            <Input.TextArea rows={6} />
          </Form.Item>
          <Form.Item name="cover_image" label={t('company.coverImage')}>
            <Input placeholder="URL" />
          </Form.Item>
          <Form.Item name="is_published" valuePropName="checked" label={t('company.publish')}>
            <Input type="checkbox" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default function Company() {
  const { t } = useTranslation();

  return (
    <Tabs items={[
      { key: 'info', label: t('company.title'), children: <CompanyInfoTab /> },
      { key: 'news', label: t('company.news'), children: <NewsTab /> },
    ]} />
  );
}
