import React, { useState } from 'react';
import { Table, Button, Space, Tag, message, Card, Tabs, Rate } from 'antd';
import { CheckOutlined, CloseOutlined, PlusOutlined } from '@ant-design/icons';

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
    message.success('Đã phê duyệt đánh giá này hiển thị công khai.');
  };

  const handleRejectReview = (id: number) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
    message.success('Đã ẩn đánh giá này.');
  };

  const promoColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Mã Code', dataIndex: 'code', key: 'code', render: (text: string) => <strong style={{ color: '#1890ff' }}>{text}</strong> },
    { title: 'Tên Chương Trình', dataIndex: 'name', key: 'name' },
    { title: 'Mức Giảm', dataIndex: 'discount', key: 'discount' },
    { title: 'Ngày Bắt Đầu', dataIndex: 'startDate', key: 'startDate' },
    { title: 'Ngày Kết Thúc', dataIndex: 'endDate', key: 'endDate' },
    { 
      title: 'Trạng Thái', 
      dataIndex: 'status', 
      key: 'status', 
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>{status === 'active' ? 'ĐANG CHẠY' : 'HẾT HẠN'}</Tag>
      ) 
    },
  ];

  const reviewColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Khách hàng', dataIndex: 'customerName', key: 'customerName' },
    { title: 'Sản phẩm', dataIndex: 'productName', key: 'productName' },
    { title: 'Đánh giá', dataIndex: 'rating', key: 'rating', render: (val: number) => <Rate disabled defaultValue={val} style={{ fontSize: 14 }} /> },
    { title: 'Nội dung bình luận', dataIndex: 'comment', key: 'comment' },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => {
        let color = 'gold';
        if (status === 'approved') color = 'green';
        if (status === 'rejected') color = 'red';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      }
    },
    { 
      title: 'Tác vụ', 
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="small">
          {record.status === 'pending' && (
            <>
              <Button icon={<CheckOutlined />} type="primary" style={{ backgroundColor: 'green', borderColor: 'green' }} onClick={() => handleApproveReview(record.id)}>Duyệt</Button>
              <Button icon={<CloseOutlined />} danger onClick={() => handleRejectReview(record.id)}>Từ chối</Button>
            </>
          )}
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card title="Quản Lý Khuyến Mãi & Duyệt Đánh Giá Khách Hàng">
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="Chương Trình Khuyến Mãi" key="1">
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => message.info('Chức năng thêm mới mã khuyến mãi đang được khởi tạo.')}>
                Thêm Mã Khuyến Mãi
              </Button>
            </div>
            <Table 
              columns={promoColumns} 
              dataSource={promotions} 
              rowKey="id"
              pagination={{ pageSize: 5 }}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Duyệt Đánh Giá Sản Phẩm" key="2">
            <Table 
              columns={reviewColumns} 
              dataSource={reviews} 
              rowKey="id"
              pagination={{ pageSize: 5 }}
            />
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </div>
  );
};
