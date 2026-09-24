import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Steps, 
  Select, 
  InputNumber, 
  Typography, 
  Alert, 
  Result, 
  Tag,
  Upload,
  Modal,
  message
} from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  ShopOutlined, 
  EnvironmentOutlined, 
  SafetyCertificateOutlined, 
  IdcardOutlined,
  InboxOutlined
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../config/axiosClient';
import { 
  FALLBACK_PROVINCES, 
  FALLBACK_DISTRICTS, 
  QUICK_PROVINCE_TAGS, 
  fetchWithTimeout, 
  removeVietnameseTones 
} from '../constants/vietnamProvinces';
import type { ProvinceItem, DistrictItem } from '../constants/vietnamProvinces';

const { Title, Text, Paragraph } = Typography;

export const Register: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredData, setRegisteredData] = useState<any>(null);

  // States tích hợp Province Open API
  const [provincesList, setProvincesList] = useState<ProvinceItem[]>(FALLBACK_PROVINCES);
  const [loadingProvinces, setLoadingProvinces] = useState<boolean>(false);
  const [districtsList, setDistrictsList] = useState<DistrictItem[]>(FALLBACK_DISTRICTS[68] || []);
  const [loadingDistricts, setLoadingDistricts] = useState<boolean>(false);

  // States quản lý tải lên nhiều tệp hình ảnh chứng nhận / giấy tờ HTX
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  // Chuyển đổi tệp sang base64 để preview nhanh
  const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  // Tự động tải nhiều tệp ảnh lên Backend qua API /api/upload/images
  const handleCustomUpload = async (options: any) => {
    const { file, onSuccess, onError, onProgress } = options;
    const formData = new FormData();
    formData.append('files', file);

    try {
      onProgress({ percent: 40 });
      const res = await axiosClient.post('/upload/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (event.total) {
            const percent = Math.round((event.loaded * 100) / event.total);
            onProgress({ percent });
          }
        }
      });

      onSuccess(res.data, file);
      message.success(`Đã tải lên tệp: ${file.name}`);
    } catch (err: any) {
      console.error('Lỗi khi tải tệp:', err);
      const errMsg = err.response?.data?.message || `Tải tệp '${file.name}' thất bại!`;
      onError(err);
      message.error(errMsg);
    }
  };

  const handleFileChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as File);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
  };

  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Tự động gọi Province Open API tải danh sách 63 tỉnh/thành phố khi component mount
  useEffect(() => {
    let isMounted = true;
    const fetchProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const res = await fetchWithTimeout('https://provinces.open-api.vn/api/p/', 4000);
        if (res.ok) {
          const data: ProvinceItem[] = await res.json();
          if (isMounted && Array.isArray(data) && data.length > 0) {
            setProvincesList(data);
          }
        }
      } catch (err) {
        console.warn('Province Open API không khả dụng, sử dụng danh mục 63 tỉnh thành cục bộ:', err);
      } finally {
        if (isMounted) setLoadingProvinces(false);
      }
    };

    fetchProvinces();
    return () => {
      isMounted = false;
    };
  }, []);

  const passwordValue = Form.useWatch('password', form) || '';
  const hasMinLength = passwordValue.length >= 8;
  const hasUppercase = /[A-Z]/.test(passwordValue);
  const hasLowercase = /[a-z]/.test(passwordValue);
  const hasNumber = /[0-9]/.test(passwordValue);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(passwordValue);

  const selectedProvince = Form.useWatch('province', form) || '';

  // Xử lý khi người dùng chọn Tỉnh / Thành phố
  const handleProvinceChange = async (provinceName: string) => {
    form.setFieldsValue({ province: provinceName, district: undefined });

    // Tìm province trong danh sách để lấy mã code
    const found = provincesList.find(p => p.name === provinceName) 
      || FALLBACK_PROVINCES.find(p => p.name === provinceName || provinceName.includes(p.name) || p.name.includes(provinceName));

    if (found) {
      setLoadingDistricts(true);
      try {
        const res = await fetchWithTimeout(`https://provinces.open-api.vn/api/p/${found.code}?depth=2`, 4000);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.districts) && data.districts.length > 0) {
            setDistrictsList(data.districts);
            return;
          }
        }
      } catch (err) {
        console.warn(`Lỗi nạp quận huyện từ Province Open API cho ${provinceName}:`, err);
      } finally {
        setLoadingDistricts(false);
      }

      // Fallback nếu API có sự cố
      if (FALLBACK_DISTRICTS[found.code]) {
        setDistrictsList(FALLBACK_DISTRICTS[found.code]);
      } else {
        setDistrictsList([]);
      }
    } else {
      setDistrictsList([]);
    }
  };

  // Xử lý khi nhấn thẻ chọn nhanh Tỉnh / Thành phố
  const handleQuickTagClick = (tag: { name: string; fullName: string }) => {
    const matched = provincesList.find(p => p.name === tag.fullName || p.name.includes(tag.name))
      || FALLBACK_PROVINCES.find(p => p.name === tag.fullName || p.name.includes(tag.name));

    const targetName = matched ? matched.name : tag.fullName;
    handleProvinceChange(targetName);
  };

  const handleNext = async () => {
    try {
      if (currentStep === 0) {
        setErrorMessage(null);
        await form.validateFields(['storeName', 'fullName', 'email', 'phone', 'password', 'confirmPassword']);

        const email = form.getFieldValue('email')?.trim().toLowerCase();
        const phone = form.getFieldValue('phone')?.trim().replace(/\s+/g, '');
        const storeName = form.getFieldValue('storeName')?.trim();

        // Kiểm tra tính duy nhất trên backend trước khi chuyển bước
        setLoading(true);
        try {
          await axiosClient.post('/auth/check-unique', { email, phone, fullName: storeName });
        } catch (checkErr: any) {
          const msg = checkErr.response?.data?.message || 'Thông tin tài khoản đã tồn tại trên hệ thống!';
          setErrorMessage(msg);
          if (msg.includes('Email') || msg.toLowerCase().includes('email')) {
            form.setFields([{ name: 'email', errors: [msg] }]);
          } else if (msg.includes('thoại') || msg.toLowerCase().includes('phone')) {
            form.setFields([{ name: 'phone', errors: [msg] }]);
          } else if (msg.includes('đơn vị') || msg.includes('người dùng')) {
            form.setFields([{ name: 'storeName', errors: [msg] }]);
          }
          setLoading(false);
          return;
        }
        setLoading(false);
        setCurrentStep(1);
      } else if (currentStep === 1) {
        await form.validateFields(['farmName', 'address', 'province', 'district', 'area', 'cropType']);
        setCurrentStep(2);
      }
    } catch (error) {
      console.log('Validation error:', error);
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    let values: any;
    try {
      values = await form.validateFields();
    } catch (formError: any) {
      console.log('Form validation failed:', formError);
      if (formError?.errorFields && formError.errorFields.length > 0) {
        const firstField = formError.errorFields[0];
        const errorText = firstField.errors?.[0] || 'Vui lòng kiểm tra lại thông tin';
        const fieldName = firstField.name?.[0];

        message.error(`Thông tin chưa hợp lệ: ${errorText}`, 6);
        setErrorMessage(`Vui lòng hoàn thiện trường "${fieldName}": ${errorText}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Tự động chuyển đến đúng bước chứa trường chưa điền để người dùng thấy ngay
        if (['storeName', 'fullName', 'email', 'phone', 'password', 'confirmPassword'].includes(fieldName)) {
          setCurrentStep(0);
        } else if (['farmName', 'address', 'province', 'district', 'area', 'cropType'].includes(fieldName)) {
          setCurrentStep(1);
        } else {
          setCurrentStep(2);
        }
      } else {
        message.error('Vui lòng kiểm tra lại các trường thông tin bắt buộc!', 6);
      }
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      // Thu thập danh sách URL các tệp hình ảnh / tài liệu đã tải lên
      const certImages: string[] = fileList
        .map(f => {
          if (f.response?.urls && Array.isArray(f.response.urls) && f.response.urls.length > 0) {
            return f.response.urls[0];
          }
          if (f.response?.files && Array.isArray(f.response.files) && f.response.files.length > 0) {
            return f.response.files[0].url;
          }
          if (f.url) return f.url;
          return null;
        })
        .filter(Boolean) as string[];

      const payload = {
        fullName: values.fullName?.trim() || '',
        storeName: values.storeName?.trim() || '',
        email: values.email?.trim().toLowerCase() || '',
        password: values.password || '',
        phone: values.phone?.trim().replace(/\s+/g, '') || '',
        farmName: values.farmName?.trim() || `${values.storeName || 'Trang trại'} Farm`,
        address: values.address?.trim() || '',
        province: values.province || 'Tỉnh Lâm Đồng',
        district: values.district || 'Thành phố Đà Lạt',
        area: values.area ? Number(values.area) : 2.5,
        cropType: values.cropType || 'Rau củ quả sạch',
        productionStandard: values.productionStandard || 'VietGAP',
        identityCard: values.identityCard?.trim() || `CCCD-${Date.now().toString().slice(-8)}`,
        businessLicense: values.businessLicense?.trim() || `BL-${Date.now().toString().slice(-6)}`,
        certImages: certImages
      };

      const res = await axiosClient.post('/users/supplier-register', payload);
      setRegisteredData({ ...payload, ...res.data });
      setIsSuccess(true);
      message.success('Nộp hồ sơ đăng ký đối tác Hợp tác xã thành công!');
    } catch (apiErr: any) {
      console.error('API register error:', apiErr);
      let errorMsg = '';

      if (apiErr.response?.data?.message) {
        errorMsg = apiErr.response.data.message;
      } else if (apiErr.response?.data?.errors) {
        const errorsObj = apiErr.response.data.errors;
        const errList: string[] = [];
        for (const key in errorsObj) {
          if (Array.isArray(errorsObj[key])) {
            errList.push(...errorsObj[key]);
          } else {
            errList.push(String(errorsObj[key]));
          }
        }
        errorMsg = errList.join(' | ') || 'Dữ liệu không hợp lệ theo quy chuẩn của máy chủ!';
      } else if (apiErr.response?.data?.title) {
        errorMsg = apiErr.response.data.title;
      } else if (typeof apiErr.response?.data === 'string') {
        errorMsg = apiErr.response.data;
      } else if (apiErr.message) {
        errorMsg = apiErr.message;
      } else {
        errorMsg = 'Đăng ký hồ sơ thất bại do máy chủ từ chối yêu cầu. Vui lòng kiểm tra lại thông tin!';
      }

      setErrorMessage(errorMsg);
      message.error(errorMsg, 8);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Nếu lỗi liên quan đến email, số điện thoại, mật khẩu hoặc tên đơn vị, lùi về bước 1 để hiển thị lỗi
      if (
        errorMsg.includes('Email') || 
        errorMsg.includes('thoại') || 
        errorMsg.includes('Mật khẩu') || 
        errorMsg.includes('đơn vị') || 
        errorMsg.includes('Hợp tác xã') ||
        errorMsg.includes('người dùng')
      ) {
        setCurrentStep(0);
        if (errorMsg.includes('Email')) form.setFields([{ name: 'email', errors: [errorMsg] }]);
        if (errorMsg.includes('thoại')) form.setFields([{ name: 'phone', errors: [errorMsg] }]);
        if (errorMsg.includes('Mật khẩu')) form.setFields([{ name: 'password', errors: [errorMsg] }]);
        if (errorMsg.includes('đơn vị') || errorMsg.includes('Hợp tác xã')) form.setFields([{ name: 'storeName', errors: [errorMsg] }]);
      }
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f0f9eb 0%, #e6f7ff 100%)',
        padding: 20
      }}>
        <Card style={{ maxWidth: 650, width: '100%', borderRadius: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
          <Result
            status="success"
            title="Nộp Hồ Sơ Đăng Ký Đối Tác Thành Công!"
            subTitle={
              <div>
                <p style={{ fontSize: 15, color: '#333', marginTop: 8 }}>
                  Hồ sơ của <b>{registeredData?.storeName}</b> đã được lưu vào hệ thống với trạng thái:
                </p>
                <Tag color="gold" style={{ fontSize: 14, padding: '4px 12px', fontWeight: 600 }}>
                  CHỜ DUYỆT (PENDING)
                </Tag>
                <Paragraph style={{ color: '#666', marginTop: 14 }}>
                  Ban Quản trị Sàn Nông sản Đà Lạt sẽ tiến hành kiểm duyệt thông tin pháp lý và chứng nhận tiêu chuẩn trong vòng <b>24 giờ làm việc</b>.
                  Khi được phê duyệt (Active), bạn sẽ có toàn quyền truy cập Vendor Dashboard để đăng nông sản và khai báo lô hàng.
                </Paragraph>
              </div>
            }
            extra={[
              <Button 
                type="primary" 
                key="login" 
                onClick={() => navigate('/login')}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', height: 42, padding: '0 24px' }}
              >
                Về Trang Đăng Nhập
              </Button>
            ]}
          />
        </Card>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0f9eb 0%, #e6f7ff 100%)',
      padding: '30px 16px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 680,
          borderRadius: 16,
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          border: '1px solid #d9f7be'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <Title level={3} style={{ margin: 0, color: '#237804' }}>
            ĐĂNG KÝ BÁN HÀNG & MỞ GIAN HÀNG NÔNG SẢN
          </Title>
          <Text type="secondary">
            Gia nhập hệ thống chuỗi cung ứng nông sản an toàn có truy xuất nguồn gốc
          </Text>
        </div>

        <Steps
          current={currentStep}
          style={{ marginBottom: 24 }}
          items={[
            { title: 'Tài khoản' },
            { title: 'Trang trại' },
            { title: 'Chứng nhận' }
          ]}
        />

        {errorMessage && (
          <Alert
            type="error"
            message={errorMessage}
            showIcon
            style={{ marginBottom: 20, borderRadius: 8 }}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          preserve={true}
          initialValues={{
            province: 'Tỉnh Lâm Đồng',
            district: 'Thành phố Đà Lạt',
            area: 3.5,
            cropType: 'Rau ăn lá & Củ quả hữu cơ',
            productionStandard: 'VietGAP'
          }}
        >
          {/* BƯỚC 1: THÔNG TIN TÀI KHOẢN & ĐẠI DIỆN */}
          <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
              <Alert 
                type="info" 
                showIcon 
                message="Bước 1: Thông tin đơn vị & Người đại diện pháp lý" 
                style={{ marginBottom: 16 }}
              />

              <Form.Item
                name="storeName"
                label="Tên Cửa hàng / Hợp tác xã / Trang trại"
                normalize={(value) => value ? value.trimStart() : ''}
                rules={[{ required: true, message: 'Vui lòng nhập tên đơn vị kinh doanh!' }]}
              >
                <Input 
                  prefix={<ShopOutlined />} 
                  placeholder="Ví dụ: Hợp Tác Xã Rau Sạch Đà Lạt Green" 
                  onBlur={async (e) => {
                    const val = e.target.value?.trim();
                    if (val) {
                      try {
                        await axiosClient.post('/auth/check-unique', { fullName: val });
                      } catch (err: any) {
                        const msg = err.response?.data?.message || 'Tên đơn vị này đã tồn tại trên hệ thống!';
                        if (msg.includes('đơn vị') || msg.includes('người dùng') || msg.includes('tồn tại')) {
                          form.setFields([{ name: 'storeName', errors: [msg] }]);
                        }
                      }
                    }
                  }}
                />
              </Form.Item>

              <Form.Item
                name="fullName"
                label="Họ và tên người đại diện pháp lý"
                normalize={(value) => value ? value.trimStart() : ''}
                rules={[{ required: true, message: 'Vui lòng nhập họ tên người đại diện!' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Ví dụ: Nguyễn Văn A" />
              </Form.Item>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Form.Item
                  name="email"
                  label="Email liên hệ & đăng nhập"
                  normalize={(value) => value ? value.trim().toLowerCase() : ''}
                  validateTrigger={['onChange', 'onBlur']}
                  rules={[
                    { required: true, message: 'Vui lòng nhập địa chỉ email!' },
                    {
                      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: 'Định dạng email không hợp lệ (ví dụ: contact@dalatgap.com)!'
                    }
                  ]}
                >
                  <Input 
                    prefix={<MailOutlined />} 
                    placeholder="email@gmail.com" 
                    onBlur={async (e) => {
                      const email = e.target.value?.trim().toLowerCase();
                      if (email && /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
                        try {
                          await axiosClient.post('/auth/check-unique', { email });
                        } catch (err: any) {
                          const msg = err.response?.data?.message || 'Email này đã tồn tại trong hệ thống!';
                          form.setFields([{ name: 'email', errors: [msg] }]);
                        }
                      }
                    }}
                  />
                </Form.Item>

                <Form.Item
                  name="phone"
                  label="Số điện thoại di động"
                  normalize={(value) => value ? value.trim().replace(/\s+/g, '') : ''}
                  validateTrigger={['onChange', 'onBlur']}
                  rules={[
                    { required: true, message: 'Vui lòng nhập số điện thoại!' },
                    { 
                      pattern: /^0\d{9}$/, 
                      message: 'Số điện thoại phải gồm đúng 10 chữ số bắt đầu bằng số 0!' 
                    }
                  ]}
                >
                  <Input 
                    prefix={<PhoneOutlined />} 
                    placeholder="09xxxxxxxx" 
                    maxLength={10} 
                    onBlur={async (e) => {
                      const phone = e.target.value?.trim().replace(/\s+/g, '');
                      if (phone && /^0\d{9}$/.test(phone)) {
                        try {
                          await axiosClient.post('/auth/check-unique', { phone });
                        } catch (err: any) {
                          const msg = err.response?.data?.message || 'Số điện thoại này đã tồn tại trong hệ thống!';
                          form.setFields([{ name: 'phone', errors: [msg] }]);
                        }
                      }
                    }}
                  />
                </Form.Item>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Form.Item
                  name="password"
                  label="Mật khẩu"
                  validateTrigger={['onChange', 'onBlur']}
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu!' },
                    () => ({
                      validator(_, value) {
                        if (!value) return Promise.reject(new Error('Vui lòng nhập mật khẩu!'));
                        if (value.length < 8) return Promise.reject(new Error('Mật khẩu phải có tối thiểu 8 ký tự!'));
                        if (!/[A-Z]/.test(value)) return Promise.reject(new Error('Mật khẩu phải chứa ít nhất 1 chữ cái in hoa (A-Z)!'));
                        if (!/[a-z]/.test(value)) return Promise.reject(new Error('Mật khẩu phải chứa ít nhất 1 chữ cái thường (a-z)!'));
                        if (!/[0-9]/.test(value)) return Promise.reject(new Error('Mật khẩu phải chứa ít nhất 1 chữ số (0-9)!'));
                        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(value)) {
                          return Promise.reject(new Error('Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (!@#$%^&*...)!'));
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="Tối thiểu 8 ký tự (hoa, thường, số, đặc biệt)" />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  label="Xác nhận mật khẩu"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: 'Vui lòng nhập lại mật khẩu!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu" />
                </Form.Item>
              </div>

              {/* Bảng checklist kiểm tra điều kiện mật khẩu trực quan */}
              <div style={{
                marginBottom: 16,
                padding: '10px 14px',
                background: '#f8fafc',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                fontSize: 12
              }}>
                <div style={{ fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Quy chuẩn bảo mật mật khẩu bắt buộc:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '4px 12px' }}>
                  <span style={{ color: hasMinLength ? '#16a34a' : '#94a3b8', fontWeight: hasMinLength ? 600 : 400 }}>
                    {hasMinLength ? '✓' : '○'} Tối thiểu 8 ký tự
                  </span>
                  <span style={{ color: hasUppercase ? '#16a34a' : '#94a3b8', fontWeight: hasUppercase ? 600 : 400 }}>
                    {hasUppercase ? '✓' : '○'} Chứa ít nhất 1 chữ hoa (A-Z)
                  </span>
                  <span style={{ color: hasLowercase ? '#16a34a' : '#94a3b8', fontWeight: hasLowercase ? 600 : 400 }}>
                    {hasLowercase ? '✓' : '○'} Chứa ít nhất 1 chữ thường (a-z)
                  </span>
                  <span style={{ color: hasNumber ? '#16a34a' : '#94a3b8', fontWeight: hasNumber ? 600 : 400 }}>
                    {hasNumber ? '✓' : '○'} Chứa ít nhất 1 chữ số (0-9)
                  </span>
                  <span style={{ color: hasSpecial ? '#16a34a' : '#94a3b8', fontWeight: hasSpecial ? 600 : 400, gridColumn: 'span 2' }}>
                    {hasSpecial ? '✓' : '○'} Chứa ít nhất 1 ký tự đặc biệt (!@#$%^&*...)
                  </span>
                </div>
              </div>
          </div>

          {/* BƯỚC 2: THÔNG TIN NÔNG TRẠI & VÙNG CANH TÁC */}
          <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
              <Alert 
                type="info" 
                showIcon 
                message="Bước 2: Địa chỉ vùng trồng & Quy mô canh tác" 
                style={{ marginBottom: 16 }}
              />

              <Form.Item
                name="farmName"
                label="Tên trang trại / Khu nông nghiệp công nghệ cao"
                normalize={(value) => value ? value.trimStart() : ''}
                rules={[{ required: true, message: 'Vui lòng nhập tên trang trại!' }]}
              >
                <Input prefix={<ShopOutlined />} placeholder="Ví dụ: Trang trại Thung Lũng Xanh" />
              </Form.Item>

              <Form.Item
                name="address"
                label="Địa chỉ chi tiết vùng trồng & kho chính"
                normalize={(value) => value ? value.trimStart() : ''}
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ vùng trồng!' }]}
              >
                <Input prefix={<EnvironmentOutlined />} placeholder="Số nhà, đường, thôn/xã..." />
              </Form.Item>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Form.Item 
                  name="province" 
                  label="Tỉnh / Thành phố" 
                  rules={[{ required: true, message: 'Vui lòng chọn Tỉnh/Thành phố!' }]}
                  tooltip="Dữ liệu danh mục Tỉnh/Thành phố được kết nối trực tiếp từ Province Open API Quốc Gia (hỗ trợ đầy đủ 63 tỉnh thành mới nhất)."
                >
                  <Select
                    showSearch
                    loading={loadingProvinces}
                    placeholder="Tìm hoặc chọn Tỉnh / Thành phố..."
                    onChange={handleProvinceChange}
                    allowClear
                    filterOption={(input, option) => {
                      if (!input) return true;
                      const cleanInput = removeVietnameseTones(input.trim().toLowerCase());
                      const label = removeVietnameseTones(String(option?.children || option?.label || option?.value || '').toLowerCase());
                      return label.includes(cleanInput);
                    }}
                    style={{ width: '100%' }}
                  >
                    {provincesList.map(prov => (
                      <Select.Option key={prov.code} value={prov.name} label={prov.name}>
                        {prov.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item 
                  name="district" 
                  label="Quận / Huyện" 
                  rules={[{ required: true, message: 'Vui lòng chọn hoặc nhập Quận/Huyện!' }]}
                  tooltip="Danh sách Quận/Huyện được tự động tải từ Province Open API theo Tỉnh/Thành phố đã chọn."
                >
                  {districtsList.length > 0 ? (
                    <Select
                      showSearch
                      loading={loadingDistricts}
                      placeholder={loadingDistricts ? "Đang tải dữ liệu quận huyện..." : "Chọn Quận / Huyện..."}
                      allowClear
                      filterOption={(input, option) => {
                        if (!input) return true;
                        const cleanInput = removeVietnameseTones(input.trim().toLowerCase());
                        const label = removeVietnameseTones(String(option?.children || option?.label || option?.value || '').toLowerCase());
                        return label.includes(cleanInput);
                      }}
                      style={{ width: '100%' }}
                    >
                      {districtsList.map(dist => (
                        <Select.Option key={dist.code} value={dist.name} label={dist.name}>
                          {dist.name}
                        </Select.Option>
                      ))}
                    </Select>
                  ) : (
                    <Input 
                      placeholder={loadingDistricts ? "Đang tải dữ liệu quận huyện..." : "Nhập Quận / Huyện / Thành phố trực thuộc..."}
                      disabled={loadingDistricts}
                    />
                  )}
                </Form.Item>
              </div>

              {/* Gợi ý chọn nhanh các trung tâm nông sản & vùng trọng điểm */}
              <div style={{ marginTop: -8, marginBottom: 14 }}>
                <span style={{ fontSize: 12, color: '#64748b', marginRight: 6 }}>📍 Chọn nhanh:</span>
                {QUICK_PROVINCE_TAGS.map((tag) => {
                  const isSelected = selectedProvince === tag.fullName || selectedProvince.includes(tag.name);
                  return (
                    <Tag 
                      key={tag.name} 
                      color={isSelected ? 'green' : 'default'}
                      style={{ cursor: 'pointer', marginBottom: 4 }}
                      onClick={() => handleQuickTagClick(tag)}
                    >
                      {tag.name}
                    </Tag>
                  );
                })}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Form.Item name="area" label="Quy mô diện tích (hecta - ha)" rules={[{ required: true }]}>
                  <InputNumber min={0.1} step={0.5} style={{ width: '100%' }} placeholder="Ví dụ: 3.5 ha" />
                </Form.Item>

                <Form.Item name="cropType" label="Nhóm nông sản chủ lực" rules={[{ required: true }]}>
                  <Select placeholder="Chọn nhóm nông sản">
                    <Select.Option value="Rau ăn lá & Rau gia vị">Rau ăn lá & Rau gia vị</Select.Option>
                    <Select.Option value="Củ quả Đà Lạt (Cà rốt, khoai tây, ớt chuông)">Củ quả Đà Lạt</Select.Option>
                    <Select.Option value="Trái cây đặc sản (Dâu tây, bơ, cam, xoài)">Trái cây đặc sản</Select.Option>
                    <Select.Option value="Nấm tươi & Nấm dược liệu">Nấm tươi & Nấm dược liệu</Select.Option>
                  </Select>
                </Form.Item>
              </div>
          </div>

          {/* BƯỚC 3: HỒ SƠ PHÁP LÝ & CHỨNG NHẬN TIÊU CHUẨN */}
          <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
              <Alert 
                type="info" 
                showIcon 
                message="Bước 3: Hồ sơ xác thực pháp lý & Chứng nhận nông sản an toàn" 
                style={{ marginBottom: 16 }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Form.Item
                  name="identityCard"
                  label="Số CCCD / Hộ chiếu người đại diện"
                  normalize={(value) => value ? value.trim() : ''}
                  rules={[{ required: false }]}
                >
                  <Input prefix={<IdcardOutlined />} placeholder="0490xxxxxxxx (Có thể để trống nếu đã đính kèm ảnh)" />
                </Form.Item>

                <Form.Item
                  name="businessLicense"
                  label="Mã số ĐKKD / Mã số HTX (Không bắt buộc)"
                  normalize={(value) => value ? value.trim() : ''}
                  rules={[{ required: false }]}
                >
                  <Input prefix={<SafetyCertificateOutlined />} placeholder="Ví dụ: 5801234567 (Tùy chọn)" />
                </Form.Item>
              </div>

              <Form.Item
                name="productionStandard"
                label="Tiêu chuẩn chứng nhận nông nghiệp chính"
                rules={[{ required: true, message: 'Vui lòng chọn tiêu chuẩn!' }]}
              >
                <Select placeholder="Chọn tiêu chuẩn chứng nhận">
                  <Select.Option value="VietGAP">VietGAP (Thực hành sản xuất nông nghiệp tốt VN)</Select.Option>
                  <Select.Option value="GlobalGAP">GlobalGAP (Tiêu chuẩn nông nghiệp toàn cầu)</Select.Option>
                  <Select.Option value="Hữu cơ Organic">Hữu cơ Organic (Không hóa chất/thuốc trừ sâu)</Select.Option>
                  <Select.Option value="OCOP 4 sao">OCOP 4 Sao (Mỗi xã một sản phẩm)</Select.Option>
                  <Select.Option value="ATTP">Chứng nhận Đủ điều kiện An toàn thực phẩm</Select.Option>
                </Select>
              </Form.Item>

              {/* KHU VỰC TẢI LÊN NHIỀU TỆP HÌNH ẢNH CHỨNG NHẬN & PHÁP LÝ */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>
                    📸 Tải lên hình ảnh hồ sơ pháp lý & Chứng nhận nông sản (Nhiều tệp):
                  </span>
                  <Tag color="green">
                    Đã tải: {fileList.length} tệp
                  </Tag>
                </div>

                <Upload.Dragger
                  name="files"
                  multiple={true}
                  fileList={fileList}
                  customRequest={handleCustomUpload}
                  onChange={handleFileChange}
                  onPreview={handlePreview}
                  listType="picture"
                  accept="image/*,.pdf"
                  style={{
                    padding: '20px 16px',
                    background: '#f8fafc',
                    border: '2px dashed #bbf7d0',
                    borderRadius: 12
                  }}
                >
                  <p className="ant-upload-drag-icon" style={{ marginBottom: 12 }}>
                    <InboxOutlined style={{ color: '#16a34a', fontSize: 44 }} />
                  </p>
                  <p className="ant-upload-text" style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', margin: '0 0 6px 0' }}>
                    Nhấp chọn hoặc kéo thả các tệp hình ảnh vào đây
                  </p>
                  <p className="ant-upload-hint" style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
                    Hỗ trợ chọn cùng lúc nhiều tệp (JPG, PNG, WEBP, PDF, tối đa 15MB/tệp).
                    <br />
                    Ví dụ: Ảnh CCCD 2 mặt, Giấy phép ĐKKD HTX, Chứng nhận VietGAP/GlobalGAP, Ảnh nông trại...
                  </p>
                </Upload.Dragger>

                {fileList.length > 0 && (
                  <Alert
                    type="success"
                    showIcon
                    style={{ marginTop: 12, borderRadius: 8 }}
                    message={`Hệ thống đã lưu ${fileList.length} tệp tài liệu chứng thực hợp lệ cho hồ sơ đối tác.`}
                  />
                )}
              </div>

              {/* Modal xem trước hình ảnh phóng to */}
              <Modal
                open={previewOpen}
                title={previewTitle}
                footer={null}
                onCancel={() => setPreviewOpen(false)}
                centered
              >
                <img alt="Xem trước tài liệu" style={{ width: '100%', borderRadius: 8 }} src={previewImage} />
              </Modal>
          </div>

          {/* CÁC NÚT ĐIỀU HƯỚNG */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
            {currentStep > 0 ? (
              <Button onClick={handlePrev} size="large">
                Quay lại
              </Button>
            ) : <div />}

            {currentStep < 2 ? (
              <Button 
                type="primary" 
                onClick={handleNext} 
                size="large"
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                Tiếp tục
              </Button>
            ) : (
              <Button 
                type="primary" 
                onClick={handleSubmit} 
                loading={loading}
                size="large"
                style={{ backgroundColor: '#237804', borderColor: '#237804', fontWeight: 600, padding: '0 28px' }}
              >
                Nộp Hồ Sơ Xét Duyệt
              </Button>
            )}
          </div>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Text style={{ fontSize: 13 }}>Đã có tài khoản đối tác? </Text>
          <Link to="/login" style={{ fontWeight: 600, color: '#237804' }}>
            Đăng nhập tại đây
          </Link>
        </div>
      </Card>
    </div>
  );
};
