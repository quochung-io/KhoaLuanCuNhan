import React from 'react';
import { Tag, Tooltip } from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  FireOutlined, 
  CloseCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

interface BatchStatusBadgeProps {
  expiryDate: string;
  status?: string;
  showTooltip?: boolean;
}

export const BatchStatusBadge: React.FC<BatchStatusBadgeProps> = ({
  expiryDate,
  status,
  showTooltip = true
}) => {
  const now = dayjs().startOf('day');
  const exp = dayjs(expiryDate).startOf('day');
  const diffDays = exp.diff(now, 'day');
  const isExpired = diffDays < 0 || status === 'Expired';

  if (isExpired) {
    const badge = (
      <Tag 
        color="#434343" 
        icon={<CloseCircleOutlined />} 
        style={{ fontWeight: 700, borderRadius: 6, padding: '2px 8px' }}
      >
        HẾT HẠN - KHÓA BÁN
      </Tag>
    );
    return showTooltip ? (
      <Tooltip title={`Lô hàng đã quá hạn sử dụng ${Math.abs(diffDays)} ngày (${exp.format('DD/MM/YYYY')}). Đã kích hoạt khóa xuất kho tự động theo chuẩn FEFO.`}>
        {badge}
      </Tooltip>
    ) : badge;
  }

  if (diffDays <= 3) {
    const badge = (
      <Tag 
        color="error" 
        icon={<FireOutlined />} 
        style={{ fontWeight: 800, borderRadius: 6, padding: '2px 8px', letterSpacing: '0.2px' }}
      >
        ⚡ FEFO: CẬN HẠN ({diffDays} NGÀY)
      </Tag>
    );
    return showTooltip ? (
      <Tooltip title={`Lô hàng chỉ còn ${diffDays} ngày lưu kho (${exp.format('DD/MM/YYYY')}). Hệ thống ưu tiên xuất kho FEFO và khuyến nghị áp dụng Dynamic Markdown giảm 30%-50%.`}>
        {badge}
      </Tooltip>
    ) : badge;
  }

  if (diffDays <= 5) {
    const badge = (
      <Tag 
        color="warning" 
        icon={<ClockCircleOutlined />} 
        style={{ fontWeight: 600, borderRadius: 6, padding: '2px 8px' }}
      >
        CHÚ Ý THEO DÕI ({diffDays} NGÀY)
      </Tag>
    );
    return showTooltip ? (
      <Tooltip title={`Lô hàng còn ${diffDays} ngày (${exp.format('DD/MM/YYYY')}). Khuyến nghị lên kế hoạch đẩy hàng hoặc giảm giá nhẹ 20%.`}>
        {badge}
      </Tooltip>
    ) : badge;
  }

  const badge = (
    <Tag 
      color="success" 
      icon={<CheckCircleOutlined />} 
      style={{ fontWeight: 600, borderRadius: 6, padding: '2px 8px' }}
    >
      AN TOÀN ({diffDays} NGÀY)
    </Tag>
  );

  return showTooltip ? (
    <Tooltip title={`Hạn sử dụng còn ${diffDays} ngày (${exp.format('DD/MM/YYYY')}). Đảm bảo độ tươi ngon tiêu chuẩn VietGAP.`}>
      {badge}
    </Tooltip>
  ) : badge;
};
