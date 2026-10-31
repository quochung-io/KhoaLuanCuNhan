// ============================================================================
// TỆP MÃ NGUỒN: web-portal/src/components/shared/OrderDeliverySlipModal.tsx
// MÔ TẢ: Thành phần/Cấu hình OrderDeliverySlipModal.tsx thuộc phân hệ Quản trị Web Portal (Admin & Nhà cung cấp).
// ============================================================================
import React, { useRef } from 'react';
import { Modal, Button, Table, Tag, Row, Col } from 'antd';
import { 
  PrinterOutlined, 
  QrcodeOutlined,
  CarOutlined,
  ShopOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

interface OrderDeliverySlipModalProps {
  open: boolean;
  order: any;
  supplierInfo?: any;
  onCancel: () => void;
  onConfirmHandover?: (orderId: number) => void;
}

export const OrderDeliverySlipModal: React.FC<OrderDeliverySlipModalProps> = ({
  open,
  order,
  supplierInfo,
  onCancel,
  onConfirmHandover
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!order) return null;

  // Hàm xử lý sự kiện tương tác người dùng (handlePrint)
  const handlePrint = () => {
    window.print();
  };

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 50,
      render: (_: any, __: any, index: number) => index + 1
    },
    {
      title: 'Tên Nông Sản Tươi',
      dataIndex: 'product',
      key: 'productName',
      render: (prod: any, record: any) => (
        <div>
          <b style={{ color: '#166534' }}>{prod?.productName || record.productName || `Nông sản #${record.productId}`}</b>
          {record.batchCode && (
            <div style={{ fontSize: 11, color: '#64748b' }}>
              Mã Lô: <Tag color="blue" style={{ fontSize: 10, margin: 0 }}>{record.batchCode}</Tag>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Số Lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (qty: number, record: any) => (
        <b>{qty} {record.unit || 'kg'}</b>
      )
    },
    {
      title: 'Đơn Giá',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 120,
      render: (price: number) => `${Number(price || 0).toLocaleString('vi-VN')} đ`
    },
    {
      title: 'Thành Tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 130,
      render: (amount: number, record: any) => {
        const val = amount || (record.quantity * (record.unitPrice || 0));
        return <b style={{ color: '#dc2626' }}>{Number(val).toLocaleString('vi-VN')} đ</b>;
      }
    }
  ];

  const orderItems = order.orderItems || [];

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      width={760}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShopOutlined style={{ color: '#16a34a', fontSize: 20 }} />
          <span>Phiếu Xuất Kho &amp; Bàn Giao Hàng Tươi Sống</span>
        </div>
      }
      footer={[
        <Button key="close" onClick={onCancel}>
          Đóng
        </Button>,
        <Button key="print" icon={<PrinterOutlined />} onClick={handlePrint}>
          In Phiếu (Print)
        </Button>,
        onConfirmHandover && order.orderStatus?.toLowerCase() !== 'shipping' && order.orderStatus?.toLowerCase() !== 'completed' && (
          <Button
            key="handover"
            type="primary"
            icon={<CarOutlined />}
            style={{ background: '#16a34a', borderColor: '#16a34a' }}
            onClick={() => onConfirmHandover(order.orderId)}
          >
            Xác Nhận Bàn Giao Cho Shipper
          </Button>
        )
      ]}
    >
      <div 
        ref={printRef} 
        style={{ 
          padding: '20px 24px', 
          background: '#ffffff', 
          border: '1px dashed #cbd5e1', 
          borderRadius: 8,
          fontSize: 13,
          color: '#0f172a'
        }}
      >
        {/* HEADER PHIẾU GIAO */}
        <Row justify="space-between" align="middle" style={{ borderBottom: '2px solid #16a34a', paddingBottom: 12 }}>
          <Col>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#16a34a', letterSpacing: '-0.5px' }}>
              HỆ THỐNG NÔNG SẢN ECC AGRI-CHAIN
            </div>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              Đối tác HTX: <b>{supplierInfo?.fullName || supplierInfo?.supplierName || 'Hợp Tác Xã Nông Sản Sạch'}</b>
            </div>
            <div style={{ fontSize: 11, color: '#64748b' }}>
              Tiêu chuẩn: <Tag color="green" style={{ fontSize: 10 }}>VietGAP / GlobalGAP</Tag>
            </div>
          </Col>
          <Col style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
              PHIẾU BÀN GIAO ĐƠN #{order.orderCode || order.orderId}
            </div>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              Ngày xuất: {dayjs().format('DD/MM/YYYY HH:mm')}
            </div>
            <Tag color="cyan" icon={<QrcodeOutlined />} style={{ marginTop: 4 }}>
              Tracking QR Code
            </Tag>
          </Col>
        </Row>

        {/* THÔNG TIN NGƯỜI NHẬN & ĐIỀU KIỆN VẬN CHUYỂN */}
        <Row gutter={[16, 12]} style={{ marginTop: 16, background: '#f8fafc', padding: '12px 14px', borderRadius: 6 }}>
          <Col span={12}>
            <div style={{ fontWeight: 700, color: '#334155', marginBottom: 4 }}>THÔNG TIN NGƯỜI NHẬN:</div>
            <div>Khách hàng: <b>{order.customer?.fullName || order.address?.receiverName || 'Khách Hàng Mua Sắm'}</b></div>
            <div>Điện thoại: <b style={{ color: '#0284c7' }}>{order.address?.phone || 'Chưa cung cấp'}</b></div>
            <div>
              Địa chỉ: {order.address?.addressDetail ? `${order.address.addressDetail}, ` : ''}
              {order.address?.district}, {order.address?.province}
            </div>
          </Col>
          <Col span={12} style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: 16 }}>
            <div style={{ fontWeight: 700, color: '#334155', marginBottom: 4 }}>YÊU CẦU BẢO QUẢN &amp; COD:</div>
            <div>
              Phương thức thanh toán: <b>{order.paymentMethod || 'COD (Thu tiền khi nhận)'}</b>
            </div>
            <div>
              Trạng thái thanh toán: <Tag color={order.paymentStatus?.toLowerCase() === 'paid' ? 'green' : 'orange'}>
                {order.paymentStatus?.toLowerCase() === 'paid' ? 'ĐÃ THANH TOÁN' : 'THU HỘ TIỀN MẶT (COD)'}
              </Tag>
            </div>
            <div style={{ color: '#dc2626', fontWeight: 600, fontSize: 12, marginTop: 4 }}>
              ⚠️ Nhiệt độ bảo quản thùng lạnh: 4°C - 8°C (Tránh dập nát)
            </div>
          </Col>
        </Row>

        {/* BẢNG CHI TIẾT SẢN PHẨM */}
        <div style={{ marginTop: 16 }}>
          <Table
            columns={columns}
            dataSource={orderItems}
            rowKey={(r: any) => r.orderItemId || r.productId}
            pagination={false}
            size="small"
            bordered
          />
        </div>

        {/* TỔNG TIỀN */}
        <div style={{ textAlign: 'right', marginTop: 12, fontSize: 14 }}>
          <span>Tổng tiền thanh toán: </span>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#dc2626' }}>
            {Number(order.totalAmount || 0).toLocaleString('vi-VN')} đ
          </span>
        </div>

        {/* CHỮ KÝ XÁC NHẬN BÀN GIAO */}
        <Row justify="space-between" style={{ marginTop: 24, textAlign: 'center' }}>
          <Col span={7}>
            <div style={{ fontWeight: 700 }}>Đại Diện Nhà Cung Cấp</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>(Ký, đóng dấu xác nhận)</div>
            <div style={{ height: 50 }} />
            <div style={{ fontStyle: 'italic', color: '#94a3b8' }}>Đã kiểm tra chất lượng</div>
          </Col>
          <Col span={7}>
            <div style={{ fontWeight: 700 }}>Nhân Viên Giao Hàng (Shipper)</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>(Đã nhận đủ hàng tươi)</div>
            <div style={{ height: 50 }} />
            <div style={{ fontStyle: 'italic', color: '#94a3b8' }}>Đã kiểm tra nhiệt độ lạnh</div>
          </Col>
          <Col span={7}>
            <div style={{ fontWeight: 700 }}>Khách Hàng Nhận Hàng</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>(Ký nhận khi giao thành công)</div>
            <div style={{ height: 50 }} />
            <div style={{ fontStyle: 'italic', color: '#94a3b8' }}>Được đồng kiểm tươi ngon</div>
          </Col>
        </Row>
      </div>
    </Modal>
  );
};
