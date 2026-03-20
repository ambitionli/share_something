import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, InputNumber, Switch, Upload, message, Popconfirm, Image } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, LoadingOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { useTranslation } from 'react-i18next';
import * as productsApi from '../services/products';
import type { Product, PaginatedProducts } from '../services/products';
import { ADMIN_TOKEN_KEY } from '../services/api';

const API_BASE = 'http://localhost:8000';

export default function Products() {
  const { t } = useTranslation();
  const [data, setData] = useState<PaginatedProducts>({ items: [], total: 0, page: 1, page_size: 10 });
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const res = await productsApi.listProducts({ page, page_size: 10, on_shelf_only: false });
      setData(res);
    } catch {
      message.error(t('messages.operationFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const urlsToFileList = (urls: string[]): UploadFile[] =>
    urls.map((url, i) => ({
      uid: `existing-${i}`,
      name: url.split('/').pop() || `image-${i}`,
      status: 'done',
      url: url.startsWith('http') ? url : `${API_BASE}${url}`,
      response: { url },
    }));

  const openModal = (record?: Product) => {
    setEditing(record || null);
    form.resetFields();
    if (record) {
      form.setFieldsValue({ ...record, price: Number(record.price) });
      setFileList(urlsToFileList(record.images || []));
    } else {
      setFileList([]);
    }
    setModalOpen(true);
  };

  const getImagesFromFileList = (): string[] =>
    fileList
      .filter((f) => f.status === 'done')
      .map((f) => f.response?.url || f.url || '')
      .filter(Boolean)
      .map((url) => url.replace(API_BASE, ''));

  const handleSave = async () => {
    const values = await form.validateFields();
    const images = getImagesFromFileList();
    const payload = { ...values, images };

    try {
      if (editing) {
        await productsApi.updateProduct(editing.id, payload);
        message.success(t('messages.updateSuccess'));
      } else {
        await productsApi.createProduct(payload);
        message.success(t('messages.createSuccess'));
      }
      setModalOpen(false);
      fetchData(data.page);
    } catch {
      message.error(t('messages.operationFailed'));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await productsApi.deleteProduct(id);
      message.success(t('messages.deleteSuccess'));
      fetchData(data.page);
    } catch {
      message.error(t('messages.operationFailed'));
    }
  };

  const toggleShelf = async (record: Product) => {
    try {
      await productsApi.updateProduct(record.id, { is_on_shelf: !record.is_on_shelf });
      message.success(t('messages.updateSuccess'));
      fetchData(data.page);
    } catch {
      message.error(t('messages.operationFailed'));
    }
  };

  const uploadProps: UploadProps = {
    action: `${API_BASE}/api/v1/upload`,
    headers: {
      Authorization: `Bearer ${localStorage.getItem(ADMIN_TOKEN_KEY) || ''}`,
    },
    listType: 'picture-card',
    fileList,
    accept: 'image/jpeg,image/png,image/gif,image/webp',
    beforeUpload: (file) => {
      const isAllowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type);
      if (!isAllowed) {
        message.error(t('upload.unsupportedFormat'));
        return Upload.LIST_IGNORE;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error(t('upload.fileTooLarge'));
        return Upload.LIST_IGNORE;
      }
      return true;
    },
    onChange: ({ fileList: newFileList, file }) => {
      setFileList(newFileList);
      if (file.status === 'uploading') {
        setUploading(true);
      }
      if (file.status === 'done') {
        setUploading(false);
        message.success(t('upload.uploadSuccess'));
      }
      if (file.status === 'error') {
        setUploading(false);
        message.error(t('upload.uploadFailed'));
      }
    },
    onPreview: async (file) => {
      setPreviewImage(file.url || file.response?.url ? `${API_BASE}${file.response?.url || ''}` : '');
      setPreviewOpen(true);
    },
    onRemove: () => true,
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    {
      title: t('products.images'),
      dataIndex: 'images',
      width: 100,
      render: (images: string[]) => {
        if (!images?.length) return '-';
        return (
          <Image.PreviewGroup>
            <Space>
              {images.slice(0, 2).map((img, i) => (
                <Image
                  key={i}
                  src={img.startsWith('http') ? img : `${API_BASE}${img}`}
                  width={50}
                  height={50}
                  style={{ objectFit: 'cover', borderRadius: 4 }}
                />
              ))}
              {images.length > 2 && <span style={{ color: '#999', fontSize: 12 }}>+{images.length - 2}</span>}
            </Space>
          </Image.PreviewGroup>
        );
      },
    },
    { title: t('products.name'), dataIndex: 'name' },
    { title: t('products.price'), dataIndex: 'price', width: 100, render: (v: string) => `¥${v}` },
    { title: t('products.stock'), dataIndex: 'stock', width: 80 },
    {
      title: t('orders.status'),
      dataIndex: 'is_on_shelf',
      width: 100,
      render: (v: boolean) => v
        ? <Tag color="green">{t('products.onShelf')}</Tag>
        : <Tag color="default">{t('products.offShelf')}</Tag>,
    },
    {
      title: t('common.actions.edit'),
      width: 200,
      render: (_: unknown, record: Product) => (
        <Space>
          <Button size="small" onClick={() => toggleShelf(record)}>
            {record.is_on_shelf ? t('products.offShelf') : t('products.onShelf')}
          </Button>
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
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>{t('products.allProducts')}</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
          {t('common.actions.add')}
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data.items}
        loading={loading}
        pagination={{
          current: data.page,
          total: data.total,
          pageSize: data.page_size,
          onChange: (p) => fetchData(p),
        }}
      />

      <Modal
        title={editing ? t('common.actions.edit') : t('common.actions.add')}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        width={640}
        okText={t('common.actions.save')}
        cancelText={t('common.actions.cancel')}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label={t('products.name')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label={t('products.description')}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="price" label={t('products.price')} rules={[{ required: true }]}>
            <InputNumber min={0} precision={2} style={{ width: '100%' }} prefix="¥" />
          </Form.Item>
          <Form.Item name="stock" label={t('products.stock')}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label={t('products.images')}>
            <Upload {...uploadProps}>
              {fileList.length >= 9 ? null : (
                <div>
                  {uploading ? <LoadingOutlined /> : <PlusOutlined />}
                  <div style={{ marginTop: 8 }}>{t('common.actions.upload')}</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          <Form.Item name="is_on_shelf" label={t('products.onShelf')} valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <Image
        style={{ display: 'none' }}
        preview={{
          visible: previewOpen,
          src: previewImage,
          onVisibleChange: (v) => setPreviewOpen(v),
        }}
      />
    </div>
  );
}
