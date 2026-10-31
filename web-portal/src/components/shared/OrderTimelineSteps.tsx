// ============================================================================
// TỆP MÃ NGUỒN: web-portal/src/components/shared/OrderTimelineSteps.tsx
// MÔ TẢ: Thành phần/Cấu hình OrderTimelineSteps.tsx thuộc phân hệ Quản trị Web Portal (Admin & Nhà cung cấp).
// ============================================================================
import React from 'react';
import { Steps, Tag } from 'antd';
import { 
  FileTextOutlined, 
  CheckCircleOutlined, 
  InboxOutlined, 
  CarOutlined, 
  SmileOutlined,
  CloseCircleOutlined,
  RollbackOutlined
} from '@ant-design/icons';

interface OrderTimelineStepsProps {
  currentStatus: string;
  size?: 'default' | 'small';
}

export const OrderTimelineSteps: React.FC<OrderTimelineStepsProps> = ({
  currentStatus,
  size = 'default'
}) => {
  const statusLower = (currentStatus || 'pending').toLowerCase();

  if (statusLower === 'cancelled') {
    return (
      <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#dc2626', fontWeight: 700 }}>
          <CloseCircleOutlined style={{ fontSize: 18 }} />
          <span>Đơn Hàng Đã Bị Hủy</span>
          <Tag color="red">Đã tự động hoàn trả tồn kho theo chuẩn FEFO</Tag>
        </div>
      </div>
    );
  }

  if (statusLower === 'returned') {
    return (
      <div style={{ padding: '12px 16px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ea580c', fontWeight: 700 }}>
          <RollbackOutlined style={{ fontSize: 18 }} />
          <span>Khách Hàng Đã Trả Hàng & Hoàn Tiền</span>
          <Tag color="orange">Đã thẩm định chất lượng tươi sống & Rollback kho</Tag>
        </div>
      </div>
    );
  }

  const getStepIndex = (st: string) => {
    switch (st) {
      case 'pending': return 0;
      case 'confirmed': return 1;
      case 'packed': return 2;
      case 'shipping': return 3;
      case 'completed': return 4;
      default: return 0;
    }
  };

  const currentStep = getStepIndex(statusLower);

  const stepsItems = [
    {
      title: 'Tiếp nhận',
      description: 'Chờ duyệt',
      icon: <FileTextOutlined />
    },
    {
      title: 'Xác nhận',
      description: 'Đã duyệt đơn',
      icon: <CheckCircleOutlined />
    },
    {
      title: 'Đóng gói',
      description: 'NCC chuẩn bị',
      icon: <InboxOutlined />
    },
    {
      title: 'Vận chuyển',
      description: 'Giao lạnh 4°C-8°C',
      icon: <CarOutlined />
    },
    {
      title: 'Hoàn tất',
      description: 'Giao thành công',
      icon: <SmileOutlined />
    }
  ];

  return (
    <Steps
      size={size}
      current={currentStep}
      items={stepsItems}
      style={{ padding: '12px 8px' }}
    />
  );
};
