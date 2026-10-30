import React, { useEffect, useState, useCallback } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Tag, 
  message, 
  Card, 
  Row, 
  Col, 
  Tooltip, 
  Upload, 
  Image,
  Popconfirm
} from 'antd';
import { 
  SafetyCertificateOutlined, 
  PlusOutlined, 
  ReloadOutlined, 
  SearchOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CloseCircleOutlined, 
  UploadOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  AuditOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { certificateService, userService, uploadService } from '../services/api';
import { MetricsCard } from '../components/shared/MetricsCard';

interface CertificateItem {
  certificateId: number;
  supplierId: number;
  supplierName?: string;
  farmId?: number;
  farmName?: string;
  certificateCode: string;
  certificateName: string;
  standardType: string;
  issuedBy: string;
  issueDate: string;
  expiryDate: string;
  daysRemaining: number;
  certificateUrl?: string;
  status: string;
  approvedBy?: number;
  approvedAt?: string;
  rejectReason?: string;
  notes?: string;
  createdAt?: string;
}

interface ComplianceSummary {
  total: number;
  valid: number;
  expiringSoon: number;
  expired: number;
  pending: number;
  rejected: number;
  complianceRate: number;
  standardBreakdown: {
    vietGap: number;
    globalGap: number;
    organic: number;
    ocop: number;
  };
}

export const Certificates: React.FC = () => {
  const [currentUser] = useState<any>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const isSupplier = (currentUser?.role || '').toUpperCase() === 'SUPPLIER' || currentUser?.roleId === 2;
  const currentSupplierId = currentUser?.supplierId || currentUser?.userId || null;

  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [summary, setSummary] = useState<ComplianceSummary>({
    total: 0,
    valid: 0,
    expiringSoon: 0,
    expired: 0,
    pending: 0,
    rejected: 0,
    complianceRate: 100,
    standardBreakdown: { vietGap: 0, globalGap: 0, organic: 0, ocop: 0 }
  });
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  // Search & Filters
  const [searchText, setSearchText] = useState('');
  const [selectedStandard, setSelectedStandard] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSupplier, setSelectedSupplier] = useState<number | 'all'>('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [editingCertId, setEditingCertId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string>('');

  const [form] = Form.useForm();

  const fetchSuppliers = useCallback(async () => {
    if (!isSupplier) {
      try {
        const res = await userService.getSuppliers();
        setSuppliers(res.data || []);
      } catch {
        // Fallback
      }
    }
  }, [isSupplier]);

  const fetchCertificates = useCallback(async () => {
    setLoading(true);
    try {
      const supId = isSupplier ? currentSupplierId : (selectedSupplier !== 'all' ? selectedSupplier : undefined);
      const params: any = {
        standardType: selectedStandard !== 'all' ? selectedStandard : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        search: searchText.trim() || undefined,
        supplierId: supId
      };

      const [certRes, sumRes] = await Promise.all([
        certificateService.getAll(params),
        certificateService.getComplianceSummary(supId)
      ]);

      setCertificates(certRes.data || []);
      if (sumRes.data) {
        setSummary(sumRes.data);
      }
    } catch {
      message.error('Không thể tải dữ liệu giấy chứng nhận pháp lý.');
    } finally {
      setLoading(false);
    }
  }, [isSupplier, currentSupplierId, selectedSupplier, selectedStandard, selectedStatus, searchText]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const handleOpenCreateModal = () => {
    setEditingCertId(null);
    setFileUrl('');
    form.resetFields();
    form.setFieldsValue({
      standardType: 'VietGAP',
      supplierId: isSupplier ? currentSupplierId : undefined,
      issueDate: dayjs(),
      expiryDate: dayjs().add(2, 'year')
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (record: CertificateItem) => {
    setEditingCertId(record.certificateId);
    setFileUrl(record.certificateUrl || '');
    form.resetFields();
    form.setFieldsValue({
      supplierId: record.supplierId,
      certificateCode: record.certificateCode,
      certificateName: record.certificateName,
      standardType: record.standardType,
      issuedBy: record.issuedBy,
      issueDate: dayjs(record.issueDate),
      expiryDate: dayjs(record.expiryDate),
      notes: record.notes
    });
    setIsModalOpen(true);
  };

  const handleSaveCertificate = async () => {
    try {
      const values = await form.validateFields();
      const payload: any = {
        supplierId: isSupplier ? currentSupplierId : values.supplierId,
        certificateCode: values.certificateCode,
        certificateName: values.certificateName,
        standardType: values.standardType,
        issuedBy: values.issuedBy,
        issueDate: values.issueDate.format('YYYY-MM-DDTHH:mm:ss[Z]'),
        expiryDate: values.expiryDate.format('YYYY-MM-DDTHH:mm:ss[Z]'),
        certificateUrl: fileUrl || undefined,
        notes: values.notes,
        isAdminCreated: !isSupplier,
        currentUserId: currentUser?.userId || 1
      };

      if (editingCertId) {
        await certificateService.update(editingCertId, payload);
        message.success('Cập nhật giấy chứng nhận thành công!');
      } else {
        await certificateService.create(payload);
        message.success(isSupplier 
          ? 'Hồ sơ đã được gửi thành công và đang chờ Quản trị viên thẩm định!' 
          : 'Đã thêm và kích hoạt giấy chứng nhận thành công!');
      }

      setIsModalOpen(false);
      fetchCertificates();
    } catch (err: any) {
      if (err.response?.data?.message) {
        message.error(err.response.data.message);
      }
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await certificateService.approve(id, currentUser?.userId || 1);
      message.success('Đã thẩm định và kích hoạt hiệu lực pháp lý cho giấy chứng nhận!');
      fetchCertificates();
    } catch {
      message.error('Phê duyệt thất bại.');
    }
  };

  const handleOpenRejectModal = (record: CertificateItem) => {
    setSelectedCert(record);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedCert) return;
    try {
      await certificateService.reject(selectedCert.certificateId, rejectReason);
      message.warning('Đã từ chối giấy chứng nhận và gửi phản hồi đến Nhà cung cấp.');
      setIsRejectModalOpen(false);
      fetchCertificates();
    } catch {
      message.error('Thao tác từ chối thất bại.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await certificateService.delete(id);
      message.success('Đã xóa hồ sơ chứng nhận thành công.');
      fetchCertificates();
    } catch {
      message.error('Xóa chứng nhận thất bại.');
    }
  };

  const handleUploadFile = async (options: any) => {
    const { file, onSuccess, onError } = options;
    setUploading(true);
    try {
      const res = await uploadService.uploadFile(file as File);
      const url = res.data?.urls?.[0] || res.data?.url || '';
      setFileUrl(url);
      message.success('Tải lên tài liệu scan thành công!');
      onSuccess('ok');
    } catch (err) {
      message.error('Tải lên tệp thất bại.');
      onError(err);
    } finally {
      setUploading(false);
    }
  };

  const renderStandardBadge = (standard: string) => {
    const std = (standard || '').toUpperCase();
    if (std.includes('GLOBALGAP')) {
      return <Tag color="blue" style={{ fontWeight: 700, padding: '2px 8px' }}>GlobalG.A.P Quốc Tế</Tag>;
    }
    if (std.includes('ORGANIC') || std.includes('HỮU CƠ')) {
      return <Tag color="purple" style={{ fontWeight: 700, padding: '2px 8px' }}>Nông Nghiệp Hữu Cơ</Tag>;
    }
    if (std.includes('OCOP')) {
      return <Tag color="orange" style={{ fontWeight: 700, padding: '2px 8px' }}>OCOP Sao Quốc Gia</Tag>;
    }
    return <Tag color="green" style={{ fontWeight: 700, padding: '2px 8px' }}>VietGAP Trồng Trọt</Tag>;
  };

  const renderStatusBadge = (record: CertificateItem) => {
    const st = (record.status || '').toLowerCase();
    if (st === 'pending') {
      return (
        <Tag color="gold" icon={<ClockCircleOutlined />}>
          CHỜ THẨM ĐỊNH
        </Tag>
      );
    }
    if (st === 'rejected' || st === 'revoked') {
      return (
        <Tag color="volcano" icon={<CloseCircleOutlined />}>
          KHÔNG HỢP LỆ
        </Tag>
      );
    }
    if (st === 'expired' || record.daysRemaining < 0) {
      return (
        <Tooltip title={`Chứng nhận đã hết hiệu lực ${Math.abs(record.daysRemaining)} ngày. Đã khóa xuất kho các nông sản thuộc vùng này.`}>
          <Tag color="error" icon={<CloseCircleOutlined />} style={{ fontWeight: 700 }}>
            HẾT HẠN (KHÓA XUẤT)
          </Tag>
        </Tooltip>
      );
    }
    if (st === 'expiringsoon' || record.daysRemaining <= 30) {
      return (
        <Tooltip title={`Chứng nhận còn hiệu lực ${record.daysRemaining} ngày. Cần liên hệ tổ chức chứng nhận để gia hạn thẩm định.`}>
          <Tag color="warning" icon={<ClockCircleOutlined />} style={{ fontWeight: 700 }}>
            CẬN HẠN ({record.daysRemaining} NGÀY)
          </Tag>
        </Tooltip>
      );
    }
    return (
      <Tooltip title={`Hiệu lực còn ${record.daysRemaining} ngày. Đủ điều kiện xuất bán và bảo chứng chất lượng.`}>
        <Tag color="success" icon={<CheckCircleOutlined />} style={{ fontWeight: 700 }}>
          HỢP LỆ ({Math.round(record.daysRemaining / 30)} THÁNG)
        </Tag>
      </Tooltip>
    );
  };

  const columns = [
    {
      title: 'Mã Chứng Nhận',
      dataIndex: 'certificateCode',
      key: 'certificateCode',
      render: (code: string, record: CertificateItem) => (
        <div>
          <b style={{ color: '#166534', fontSize: 13 }}>{code}</b>
          <div style={{ fontSize: 11, color: '#64748b' }}>
            {record.certificateName}
          </div>
        </div>
      )
    },
    {
      title: 'Tiêu Chuẩn',
      dataIndex: 'standardType',
      key: 'standardType',
      width: 170,
      render: (std: string) => renderStandardBadge(std)
    },
    ...(!isSupplier ? [{
      title: 'Nhà Cung Cấp / HTX',
      dataIndex: 'supplierName',
      key: 'supplierName',
      render: (name: string, record: CertificateItem) => (
        <div>
          <b style={{ color: '#0f172a' }}>{name || `NCC #${record.supplierId}`}</b>
          {record.farmName && (
            <div style={{ fontSize: 11, color: '#64748b' }}>
              Vùng trồng: {record.farmName}
            </div>
          )}
        </div>
      )
    }] : []),
    {
      title: 'Cơ Quan Cấp Thẩm Quyền',
      dataIndex: 'issuedBy',
      key: 'issuedBy',
      render: (issuedBy: string) => (
        <span style={{ fontSize: 12, color: '#334155' }}>{issuedBy}</span>
      )
    },
    {
      title: 'Thời Hạn Hiệu Lực',
      key: 'validity',
      width: 190,
      render: (_: any, record: CertificateItem) => (
        <div style={{ fontSize: 12 }}>
          <div>Từ: <b>{dayjs(record.issueDate).format('DD/MM/YYYY')}</b></div>
          <div>Đến: <b>{dayjs(record.expiryDate).format('DD/MM/YYYY')}</b></div>
        </div>
      )
    },
    {
      title: 'Tài Liệu Scan',
      dataIndex: 'certificateUrl',
      key: 'certificateUrl',
      width: 110,
      render: (url: string) => {
        if (!url) return <span style={{ color: '#94a3b8', fontSize: 11 }}>Chưa tải lên</span>;
        const fullUrl = url.startsWith('http') ? url : `http://localhost:5023${url}`;
        return (
          <Image
            src={fullUrl}
            alt="Chứng nhận"
            width={48}
            height={36}
            style={{ objectFit: 'cover', borderRadius: 4, border: '1px solid #e2e8f0' }}
            fallback="https://placehold.co/100x75?text=Cert"
          />
        );
      }
    },
    {
      title: 'Tình Trạng Pháp Lý',
      key: 'status',
      width: 180,
      render: (_: any, record: CertificateItem) => renderStatusBadge(record)
    },
    {
      title: 'Thao Tác',
      key: 'action',
      width: 180,
      render: (_: any, record: CertificateItem) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết & Thẩm định pháp lý">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedCert(record);
                setIsVerifyModalOpen(true);
              }}
            />
          </Tooltip>

          {!isSupplier && record.status === 'Pending' && (
            <>
              <Tooltip title="Phê duyệt chứng nhận">
                <Button
                  size="small"
                  type="primary"
                  icon={<CheckOutlined />}
                  style={{ background: '#16a34a', borderColor: '#16a34a' }}
                  onClick={() => handleApprove(record.certificateId)}
                />
              </Tooltip>
              <Tooltip title="Từ chối chứng nhận">
                <Button
                  size="small"
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => handleOpenRejectModal(record)}
                />
              </Tooltip>
            </>
          )}

          <Tooltip title="Chỉnh sửa hồ sơ">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleOpenEditModal(record)}
            />
          </Tooltip>

          <Popconfirm
            title="Xác nhận xóa giấy chứng nhận này?"
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record.certificateId)}
          >
            <Tooltip title="Xóa">
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '0 4px' }}>
      {/* HEADER SECTION */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 16,
          background: '#ffffff',
          padding: '16px 20px',
          borderRadius: 8,
          border: '1px solid #f1f5f9'
        }}
      >
        <div>
          <h2 style={{ margin: 0, color: '#166534', display: 'flex', alignItems: 'center', gap: 8 }}>
            <SafetyCertificateOutlined />
            {isSupplier ? 'Hồ Sơ Chứng Nhận Tiêu Chuẩn Nông Sản Của Tôi' : 'Hệ Thống Giám Sát Pháp Lý & Chứng Nhận Nông Sản Toàn Quốc'}
          </h2>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>
            Chuẩn hóa quy trình truy xuất nguồn gốc theo tiêu chuẩn VietGAP, GlobalG.A.P, Organic &amp; OCOP.
          </p>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchCertificates}>
            Làm Mới
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            style={{ background: '#16a34a', borderColor: '#16a34a' }}
            onClick={handleOpenCreateModal}
          >
            {isSupplier ? 'Nộp Hồ Sơ Chứng Nhận Mới' : 'Thêm Giấy Chứng Nhận'}
          </Button>
        </Space>
      </div>

      {/* KPI METRICS (SHARED COMPONENT) */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={8} md={4}>
          <MetricsCard
            title="Tổng Số Hồ Sơ"
            value={summary.total}
            icon={<AuditOutlined />}
            color="blue"
            subtitle="Chứng nhận trong hệ thống"
          />
        </Col>
        <Col xs={12} sm={8} md={4}>
          <MetricsCard
            title="Đang Có Hiệu Lực"
            value={summary.valid}
            icon={<CheckCircleOutlined />}
            color="green"
            subtitle="Đạt chuẩn xuất bán"
          />
        </Col>
        <Col xs={12} sm={8} md={4}>
          <MetricsCard
            title="Cảnh Báo Cận Hạn"
            value={summary.expiringSoon}
            icon={<ClockCircleOutlined />}
            color="orange"
            subtitle="Hết hạn trong 30 ngày"
          />
        </Col>
        <Col xs={12} sm={8} md={4}>
          <MetricsCard
            title="Đã Hết Hạn"
            value={summary.expired}
            icon={<CloseCircleOutlined />}
            color="red"
            subtitle="Đã tự động khóa lô"
          />
        </Col>
        <Col xs={12} sm={8} md={4}>
          <MetricsCard
            title="Chờ Thẩm Định"
            value={summary.pending}
            icon={<ClockCircleOutlined />}
            color="purple"
            subtitle="Hồ sơ mới gửi lên"
          />
        </Col>
        <Col xs={12} sm={8} md={4}>
          <MetricsCard
            title="Tỷ Lệ Tuân Thủ"
            value={`${summary.complianceRate}%`}
            icon={<SafetyCertificateOutlined />}
            color="green"
            subtitle="Chứng nhận an toàn"
          />
        </Col>
      </Row>

      {/* FILTERS CARD */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Input
              placeholder="Tìm theo mã số, tên chứng nhận, cơ quan cấp..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={8} md={5}>
            <Select
              style={{ width: '100%' }}
              value={selectedStandard}
              onChange={setSelectedStandard}
              options={[
                { label: 'Tất cả tiêu chuẩn', value: 'all' },
                { label: 'VietGAP (Thực hành tốt)', value: 'VietGAP' },
                { label: 'GlobalGAP (Toàn cầu)', value: 'GlobalGAP' },
                { label: 'Organic (Hữu cơ)', value: 'Organic' },
                { label: 'OCOP (Mỗi xã một sp)', value: 'OCOP' },
                { label: 'HACCP / ISO22000', value: 'HACCP' }
              ]}
            />
          </Col>
          <Col xs={12} sm={8} md={5}>
            <Select
              style={{ width: '100%' }}
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={[
                { label: 'Tất cả trạng thái', value: 'all' },
                { label: 'Đang có hiệu lực (Valid)', value: 'Valid' },
                { label: 'Cận hạn < 30 ngày (Warning)', value: 'ExpiringSoon' },
                { label: 'Hết hạn (Expired)', value: 'Expired' },
                { label: 'Chờ thẩm định (Pending)', value: 'Pending' },
                { label: 'Bị từ chối (Rejected)', value: 'Rejected' }
              ]}
            />
          </Col>
          {!isSupplier && (
            <Col xs={24} sm={8} md={6}>
              <Select
                style={{ width: '100%' }}
                placeholder="Lọc theo Nhà cung cấp / HTX"
                value={selectedSupplier}
                onChange={setSelectedSupplier}
                allowClear
                options={[
                  { label: 'Tất cả Nhà Cung Cấp', value: 'all' },
                  ...suppliers.map(s => ({
                    label: s.fullName || s.supplierName || `NCC #${s.supplierId}`,
                    value: s.supplierId
                  }))
                ]}
              />
            </Col>
          )}
          <Col xs={24} sm={8} md={2} style={{ textAlign: 'right' }}>
            <Button
              onClick={() => {
                setSearchText('');
                setSelectedStandard('all');
                setSelectedStatus('all');
                setSelectedSupplier('all');
              }}
            >
              Đặt lại
            </Button>
          </Col>
        </Row>
      </Card>

      {/* TABLE */}
      <Card bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={certificates}
          rowKey="certificateId"
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (t) => `Tổng cộng: ${t} hồ sơ` }}
          size="middle"
        />
      </Card>

      {/* MODAL THÊM / SỬA GIẤY CHỨNG NHẬN */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SafetyCertificateOutlined style={{ color: '#16a34a' }} />
            <span>{editingCertId ? 'Chỉnh Sửa Hồ Sơ Chứng Nhận' : (isSupplier ? 'Nộp Hồ Sơ Chứng Nhận Mới' : 'Khai Báo Giấy Chứng Nhận Pháp Lý')}</span>
          </div>
        }
        open={isModalOpen}
        onOk={handleSaveCertificate}
        onCancel={() => setIsModalOpen(false)}
        width={680}
        okText={editingCertId ? 'Lưu Thay Đổi' : (isSupplier ? 'Nộp Hồ Sơ Chờ Duyệt' : 'Khai Báo & Kích Hoạt')}
        cancelText="Đóng"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 12 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="certificateCode"
                label="Mã Số Giấy Chứng Nhận"
                rules={[{ required: true, message: 'Vui lòng nhập mã chứng nhận (VD: VG-2024-0982)' }]}
              >
                <Input placeholder="VD: VG-2024-VN-0892, GG-GLOBAL-8831" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="standardType"
                label="Hệ Tiêu Chuẩn Nông Nghiệp"
                rules={[{ required: true, message: 'Vui lòng chọn tiêu chuẩn' }]}
              >
                <Select
                  options={[
                    { label: 'VietGAP (Thực hành Nông nghiệp Tốt)', value: 'VietGAP' },
                    { label: 'GlobalG.A.P (Tiêu chuẩn Toàn cầu)', value: 'GlobalGAP' },
                    { label: 'Nông nghiệp Hữu cơ (Organic)', value: 'Organic' },
                    { label: 'OCOP Sao Quốc Gia', value: 'OCOP' },
                    { label: 'HACCP / ISO 22000 An toàn Thực phẩm', value: 'HACCP' }
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="certificateName"
            label="Tên Đầy Đủ Giấy Chứng Nhận"
            rules={[{ required: true, message: 'Vui lòng nhập tên chứng nhận' }]}
          >
            <Input placeholder="VD: Giấy chứng nhận Tiêu chuẩn Thực hành Nông nghiệp Tốt VietGAP Trồng trọt" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="issuedBy"
                label="Cơ Quan / Tổ Chức Cấp Thẩm Quyền"
                rules={[{ required: true, message: 'Vui lòng nhập cơ quan cấp' }]}
              >
                <Input placeholder="VD: Trung tâm Chứng nhận Chất lượng Nông nghiệp Quốc gia" />
              </Form.Item>
            </Col>
            {!isSupplier && (
              <Col span={12}>
                <Form.Item
                  name="supplierId"
                  label="Nhà Cung Cấp / Hợp Tác Xã Trực Thuộc"
                  rules={[{ required: true, message: 'Vui lòng chọn nhà cung cấp' }]}
                >
                  <Select
                    placeholder="Chọn Nhà cung cấp"
                    options={suppliers.map(s => ({
                      label: s.fullName || s.supplierName || `NCC #${s.supplierId}`,
                      value: s.supplierId
                    }))}
                  />
                </Form.Item>
              </Col>
            )}
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="issueDate"
                label="Ngày Cấp Giấy Phép"
                rules={[{ required: true, message: 'Vui lòng chọn ngày cấp' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="expiryDate"
                label="Ngày Hết Hiệu Lực (Hạn sử dụng chứng nhận)"
                rules={[{ required: true, message: 'Vui lòng chọn ngày hết hạn' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Tài Liệu Scan / Ảnh Chụp Bản Gốc Chứng Nhận">
            <Upload
              customRequest={handleUploadFile}
              showUploadList={false}
              accept="image/*,.pdf"
            >
              <Button icon={<UploadOutlined />} loading={uploading}>
                {uploading ? 'Đang tải lên...' : 'Tải lên hình ảnh scan / file PDF'}
              </Button>
            </Upload>
            {fileUrl && (
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                <Image
                  src={fileUrl.startsWith('http') ? fileUrl : `http://localhost:5023${fileUrl}`}
                  width={60}
                  height={45}
                  style={{ objectFit: 'cover', borderRadius: 4 }}
                />
                <span style={{ fontSize: 12, color: '#16a34a' }}>Đã tải lên tệp: {fileUrl}</span>
              </div>
            )}
          </Form.Item>

          <Form.Item name="notes" label="Ghi Chú Pháp Lý & Quy Phạm">
            <Input.TextArea rows={2} placeholder="Thông tin bổ sung về phạm vi chứng nhận (diện tích, sản lượng, vùng canh tác)..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL TỪ CHỐI DUYỆT */}
      <Modal
        title="Từ Chối Phê Duyệt Hồ Sơ Chứng Nhận"
        open={isRejectModalOpen}
        onOk={handleConfirmReject}
        onCancel={() => setIsRejectModalOpen(false)}
        okText="Xác Nhận Từ Chối"
        okButtonProps={{ danger: true }}
        cancelText="Hủy Bỏ"
      >
        <p style={{ color: '#64748b' }}>
          Vui lòng nhập lý do từ chối để thông báo đến Nhà cung cấp hoàn thiện và bổ sung hồ sơ:
        </p>
        <Input.TextArea
          rows={3}
          placeholder="Lý do: Tài liệu scan bị mờ, mã chứng nhận không hợp lệ trên cổng thông tin quốc gia, hết hiệu lực..."
          value={rejectReason}
          onChange={e => setRejectReason(e.target.value)}
        />
      </Modal>

      {/* MODAL CHI TIẾT THẨM ĐỊNH PHÁP LÝ */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SafetyCertificateOutlined style={{ color: '#16a34a', fontSize: 18 }} />
            <span>Biên Bản Thẩm Định Pháp Lý Giấy Chứng Nhận Nông Sản</span>
          </div>
        }
        open={isVerifyModalOpen}
        onCancel={() => setIsVerifyModalOpen(false)}
        width={620}
        footer={[
          <Button key="close" onClick={() => setIsVerifyModalOpen(false)}>
            Đóng
          </Button>
        ]}
      >
        {selectedCert && (
          <div style={{ fontSize: 13, color: '#0f172a' }}>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: 8, marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#166534', marginBottom: 4 }}>
                {selectedCert.certificateName}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                {renderStandardBadge(selectedCert.standardType)}
                {renderStatusBadge(selectedCert)}
              </div>
            </div>

            <Row gutter={[16, 12]}>
              <Col span={12}>
                <div style={{ color: '#64748b', fontSize: 11 }}>MÃ CHỨNG NHẬN:</div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{selectedCert.certificateCode}</div>
              </Col>
              <Col span={12}>
                <div style={{ color: '#64748b', fontSize: 11 }}>NHÀ CUNG CẤP / HTX:</div>
                <div style={{ fontWeight: 700 }}>{selectedCert.supplierName || `NCC #${selectedCert.supplierId}`}</div>
              </Col>
              <Col span={12}>
                <div style={{ color: '#64748b', fontSize: 11 }}>CƠ QUAN THẨM QUYỀN CẤP:</div>
                <div style={{ fontWeight: 600 }}>{selectedCert.issuedBy}</div>
              </Col>
              <Col span={12}>
                <div style={{ color: '#64748b', fontSize: 11 }}>VÙNG TRỒNG / NÔNG TRẠI:</div>
                <div>{selectedCert.farmName || 'Toàn bộ vùng canh tác thuộc HTX'}</div>
              </Col>
              <Col span={12}>
                <div style={{ color: '#64748b', fontSize: 11 }}>NGÀY CẤP HIỆU LỰC:</div>
                <div>{dayjs(selectedCert.issueDate).format('DD/MM/YYYY')}</div>
              </Col>
              <Col span={12}>
                <div style={{ color: '#64748b', fontSize: 11 }}>NGÀY HẾT HIỆU LỰC:</div>
                <div style={{ color: selectedCert.daysRemaining < 0 ? '#dc2626' : '#16a34a', fontWeight: 700 }}>
                  {dayjs(selectedCert.expiryDate).format('DD/MM/YYYY')} ({selectedCert.daysRemaining >= 0 ? `Còn ${selectedCert.daysRemaining} ngày` : `Quá hạn ${Math.abs(selectedCert.daysRemaining)} ngày`})
                </div>
              </Col>
            </Row>

            {selectedCert.certificateUrl && (
              <div style={{ marginTop: 16 }}>
                <div style={{ color: '#64748b', fontSize: 11, marginBottom: 6 }}>BẢN SCAN GỐC:</div>
                <Image
                  src={selectedCert.certificateUrl.startsWith('http') ? selectedCert.certificateUrl : `http://localhost:5023${selectedCert.certificateUrl}`}
                  width="100%"
                  style={{ maxHeight: 280, objectFit: 'contain', borderRadius: 6, border: '1px solid #e2e8f0' }}
                />
              </div>
            )}

            {selectedCert.rejectReason && (
              <div style={{ marginTop: 16, padding: '10px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6 }}>
                <b style={{ color: '#dc2626' }}>Lý do từ chối: </b>
                <span style={{ color: '#7f1d1d' }}>{selectedCert.rejectReason}</span>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
