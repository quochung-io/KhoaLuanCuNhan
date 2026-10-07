import React, { useState } from 'react';
import { Table, Button, Space, Tag, message, Card, Tabs, Rate } from 'antd';
import { CheckOutlined, CloseOutlined, PlusOutlined, PercentageOutlined, StarOutlined } from '@ant-design/icons';

// Mock data cho Khuyến mãi
const mockPromotions = [
  { id: 1, code: 'NONGANSANH', name: 'Giảm giá 10% nông sản sạch', discount: '10%', startDate: '2026-08-01', endDate: '2026-08-31', status: 'active' },
  { id: 2, code: 'FREESHIP', name: 'Miễn phí vận chuyển khu vực HCM', discount: 'Freeship', startDate: '2026-08-15', endDate: '2026-09-15', status: 'active' },
  { id: 3, code: 'LANDAUTIEN', name: 'Mã giảm giá cho khách hàng mới', discount: '20,000 đ', startDate: '2026-01-01', endDate: '2026-12-31', status: 'expired' },
];

// Mock data cho Đánh giá sản phẩm
const mockReviews = [
  { id: 1, customerName: 'Hoàng Long', productName: 'Gạo ST25', rating: 5, comment: 'Gạo rất dẻo và thơm ngon, sẽ tiếp tục ủng hộ HTX Sóc Trăng.', status: 'pending' },
  { id: 2, customerName: 'Minh Thư', productName: 'Sầu riêng Ri6', rating: 4, comment: 'Sầu riêng chín đều, cơm dày nhưng giao hơi chậm chút.', status: 'pending' },
  { id: 3, customerName: 'Thanh Sơn', productName: 'Bơ sáp Đắk Lắk', rating: 5, comment: 'Bơ béo ngậy, hạt siêu nhỏ, chất lượng rất VietGAP.', status: 'approved' },
];

export const PromotionsReviews: React.FC = () => {
  const [promotions] = useState(mockPromotions);
  const [reviews, setReviews] = useState(mockReviews);

  const handleApproveReview = (id: number) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
    message.success('Đã phê duyệt đánh giá này hiển thị công khai trên website & ứng dụng.');
  };

  const handleRejectReview = (id: number) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
    message.success('Đã ẩn đánh giá này.');
  };

  const promoColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70, render: (id: number) => <Tag color="default">#{id}</Tag> },
    { 
      title: 'Mã Voucher', 
      dataIndex: 'code', 
      key: 'code', 
      render: (text: string) => <Tag color="blue" style={{ fontWeight: 700, fontSize: 13, padding: '3px 10px' }}>{text}</Tag> 
    },
    { title: 'Tên Chương Trình', dataIndex: 'name', key: 'name', render: (t: string) => <span style={{ fontWeight: 600 }}>{t}</span> },
    { title: 'Mức Giảm', dataIndex: 'discount', key: 'discount', render: (d: string) => <span style={{ color: '#16a34a', fontWeight: 700 }}>{d}</span> },
    { title: 'Ngày Bắt Đầu', dataIndex: 'startDate', key: 'startDate', render: (d: string) => <span style={{ color: '#64748b' }}>{d}</span> },
    { title: 'Ngày Kết Thúc', dataIndex: 'endDate', key: 'endDate', render: (d: string) => <span style={{ color: '#64748b' }}>{d}</span> },
    { 
      title: 'Trạng Thái', 
      dataIndex: 'status', 
      key: 'status', 
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'error'} style={{ borderRadius: 999 }}>
          {status === 'active' ? 'ĐANG ÁP DỤNG' : 'HẾT HIỆU LỰC'}
        </Tag>
      ) 
    },
  ];

  const reviewColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70, render: (id: number) => <Tag color="default">#{id}</Tag> },
    { title: 'Khách hàng', dataIndex: 'customerName', key: 'customerName', render: (n: string) => <strong>{n}</strong> },
    { title: 'Sản phẩm', dataIndex: 'productName', key: 'productName', render: (p: string) => <span style={{ color: '#16a34a', fontWeight: 600 }}>{p}</span> },
    { title: 'Đánh giá', dataIndex: 'rating', key: 'rating', render: (val: number) => <Rate disabled defaultValue={val} style={{ fontSize: 13 }} /> },
    { title: 'Nội dung bình luận', dataIndex: 'comment', key: 'comment' },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => {
        let color = 'gold';
        if (status === 'approved') color = 'green';
        if (status === 'rejected') color = 'red';
        return (
          <Tag color={color} style={{ borderRadius: 999 }}>
            {status === 'approved' ? 'ĐÃ DUYỆT' : status === 'rejected' ? 'ĐÃ ẨN' : 'CHỜ DUYỆT'}
          </Tag>
        );
      }
    },
    { 
      title: 'Tác vụ', 
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="small">
          {record.status === 'pending' && (
            <>
              <Button size="small" icon={<CheckOutlined />} type="primary" onClick={() => handleApproveReview(record.id)}>
                Duyệt
              </Button>
              <Button size="small" icon={<CloseOutlined />} danger onClick={() => handleRejectReview(record.id)}>
                Ẩn
              </Button>
            </>
          )}
        </Space>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Card 
        style={{ borderRadius: 14 }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              <PercentageOutlined />
            </div>
            <div>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Quản Lý Khuyến Mãi & Duyệt Đánh Giá Khách Hàng</span>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 400 }}>Tạo mã coupon kích cầu và kiểm duyệt phản hồi trải nghiệm mua hàng</div>
            </div>
          </div>
        }
      >
        <Tabs 
          defaultActiveKey="1"
          items={[
            {
              key: '1',
              label: (
                <Space>
                  <PercentageOutlined />
                  <span>Chương Trình Khuyến Mãi ({promotions.length})</span>
                </Space>
              ),
              children: (
                <div>
                  <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => message.info('Chức năng thêm mới mã khuyến mãi đang được tích hợp.')}>
                      Thêm Mã Khuyến Mãi Mới
                    </Button>
                  </div>
                  <Table 
                    columns={promoColumns} 
                    dataSource={promotions} 
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                  />
                </div>
              )
            },
            {
              key: '2',
              label: (
                <Space>
                  <StarOutlined />
                  <span>Duyệt Đánh Giá & Phản Hồi ({reviews.length})</span>
                </Space>
              ),
              children: (
                <Table 
                  columns={reviewColumns} 
                  dataSource={reviews} 
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
                />
              )
            }
          ]}
        />
      </Card>
    </div>
  );
};
