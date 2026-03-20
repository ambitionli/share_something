import { useCallback, useEffect, useState } from 'react';
import { Table, Button, Tag, Modal, Form, Input, Select, Space, message } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { orderStatusTagColor } from '../utils/orderStatus';

type OrderRow = {
  id: number;
  shipping_address: Record<string, unknown>;
  total_amount: string;
  status: string;
  payment_method: string | null;
  tracking_number: string | null;
  express_company: string | null;
  created_at: string;
};

type PaginatedOrders = {
  items: OrderRow[];
  total: number;
  page: number;
  page_size: number;
};

const STATUS_OPTIONS = ['pending', 'paid', 'shipped', 'completed', 'cancelled'] as const;

export default function Orders() {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<PaginatedOrders>({ items: [], total: 0, page: 1, page_size: 10 });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [shipModalOpen, setShipModalOpen] = useState(false);
  const [shippingOrderId, setShippingOrderId] = useState<number | null>(null);
  const [form] = Form.useForm<{ express_company: string; tracking_number: string }>();

  const fetchOrders = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await api.get<PaginatedOrders>('/api/v1/orders/all', {
        params: {
          page: p,
          page_size: pageSize,
          ...(statusFilter ? { status_filter: statusFilter } : {}),
        },
      });
      setData(res.data);
    } catch {
      message.error(t('messages.operationFailed'));
    } finally {
      setLoading(false);
    }
  }, [pageSize, statusFilter, t]);

  useEffect(() => {
    void fetchOrders(page);
  }, [fetchOrders, page]);

  const openShipModal = (record: OrderRow) => {
    setShippingOrderId(record.id);
    form.resetFields();
    setShipModalOpen(true);
  };

  const submitShip = async () => {
    const values = await form.validateFields();
    if (shippingOrderId === null) {
      return;
    }
    try {
      await api.post(`/api/v1/orders/${shippingOrderId}/ship`, {
        express_company: values.express_company,
        tracking_number: values.tracking_number,
      });
      message.success(t('orders.shipSuccess'));
      setShipModalOpen(false);
      void fetchOrders(page);
    } catch {
      message.error(t('messages.operationFailed'));
    }
  };

  const buyerPhone = (row: OrderRow): string => {
    const addr = row.shipping_address;
    if (addr && typeof addr === 'object' && 'phone' in addr && typeof addr.phone === 'string') {
      return addr.phone;
    }
    return '—';
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString(i18n.language === 'zh-CN' ? 'zh-CN' : 'en-US');

  const statusLabel = (s: string) => {
    switch (s) {
      case 'pending':
        return t('orderStatus.pending');
      case 'paid':
        return t('orderStatus.paid');
      case 'shipped':
        return t('orderStatus.shipped');
      case 'completed':
        return t('orderStatus.completed');
      case 'cancelled':
        return t('orderStatus.cancelled');
      default:
        return s;
    }
  };

  const columns: ColumnsType<OrderRow> = [
    {
      title: t('orders.columnId'),
      dataIndex: 'id',
      key: 'id',
      width: 88,
    },
    {
      title: t('orders.buyerPhone'),
      key: 'buyer_phone',
      render: (_, row) => buyerPhone(row),
    },
    {
      title: t('orders.amount'),
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (v: unknown) => String(v ?? ''),
    },
    {
      title: t('orders.status'),
      dataIndex: 'status',
      key: 'status',
      render: (s: unknown) => (
        <Tag color={orderStatusTagColor(String(s))}>{statusLabel(String(s))}</Tag>
      ),
    },
    {
      title: t('orders.paymentMethod'),
      dataIndex: 'payment_method',
      key: 'payment_method',
      render: (v: string | null) => v ?? '—',
    },
    {
      title: t('orders.tracking'),
      key: 'tracking',
      render: (_, row) => row.tracking_number ?? '—',
    },
    {
      title: t('orders.createdAt'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (iso: string) => formatTime(iso),
    },
    {
      title: t('orders.actions'),
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<ShoppingCartOutlined />}
          disabled={record.status !== 'paid'}
          onClick={() => openShipModal(record)}
        >
          {t('orders.ship')}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }} wrap>
        <span>{t('orders.status')}</span>
        <Select
          allowClear
          placeholder={t('orders.filterAll')}
          style={{ minWidth: 200 }}
          value={statusFilter}
          onChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
          options={STATUS_OPTIONS.map((s) => ({
            value: s,
            label: statusLabel(s),
          }))}
        />
      </Space>
      <Table<OrderRow>
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={data.items}
        pagination={{
          current: page,
          pageSize,
          total: data.total,
          showSizeChanger: false,
          onChange: (p) => setPage(p),
        }}
      />
      <Modal
        title={t('orders.ship')}
        open={shipModalOpen}
        onCancel={() => setShipModalOpen(false)}
        onOk={() => void submitShip()}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="express_company"
            label={t('orders.expressCompany')}
            rules={[{ required: true, message: t('orders.expressCompany') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="tracking_number"
            label={t('orders.tracking')}
            rules={[{ required: true, message: t('orders.tracking') }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
