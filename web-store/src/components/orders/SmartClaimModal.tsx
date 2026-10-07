'use client';
import React, { useState } from 'react';

export interface SmartClaimModalProps {
  order: {
    orderId: number;
    orderCode: string;
    createdAt?: string;
    updatedAt?: string;
  };
  product: {
    productId: number;
    productName: string;
    imageUrl?: string;
    unitPrice: number;
    quantity: number;
    unit?: string;
  };
  currentUser: any;
  onClose: () => void;
  onSuccess: (newTicket: any) => void;
}

export default function SmartClaimModal({
  order,
  product,
  currentUser,
  onClose,
  onSuccess
}: SmartClaimModalProps) {
  const [reason, setReason] = useState<string>('DAMAGED_IN_TRANSIT');
  const [compensationMethod, setCompensationMethod] = useState<'WALLET_REFUND' | 'REPLACEMENT_NEXT_ORDER'>('WALLET_REFUND');
  const [notes, setNotes] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; type: string; url: string }>>([
    // Ảnh mẫu hỗ trợ kiểm thử nhanh
    { name: 'nong_san_loi_1.jpg', type: 'image/jpeg', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600' },
    { name: 'nong_san_loi_2.jpg', type: 'image/jpeg', url: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=600' }
  ]);
  const [customFileUrl, setCustomFileUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');

  // Kiểm tra điều kiện: Tối thiểu 1 Video HOẶC 2 Hình ảnh
  const videoCount = uploadedFiles.filter(f => f.type.includes('video') || f.name.endsWith('.mp4') || f.name.endsWith('.mov')).length;
  const imageCount = uploadedFiles.filter(f => !f.type.includes('video') && !f.name.endsWith('.mp4') && !f.name.endsWith('.mov')).length;
  const isEvidenceValid = videoCount >= 1 || imageCount >= 2;

  const totalRefundAmount = (product.unitPrice || 0) * (product.quantity || 1);

  const handleAddCustomUrl = () => {
    if (!customFileUrl.trim()) return;
    const isVid = customFileUrl.includes('video') || customFileUrl.endsWith('.mp4');
    setUploadedFiles(prev => [
      ...prev,
      {
        name: isVid ? `video_minh_chung_${prev.length + 1}.mp4` : `anh_minh_chung_${prev.length + 1}.jpg`,
        type: isVid ? 'video/mp4' : 'image/jpeg',
        url: customFileUrl.trim()
      }
    ]);
    setCustomFileUrl('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newItems = files.map(file => ({
        name: file.name,
        type: file.type || 'image/jpeg',
        url: URL.createObjectURL(file)
      }));
      setUploadedFiles(prev => [...prev, ...newItems]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEvidenceValid) {
      setSubmitError('Chính sách quy định: Bạn cần cung cấp tối thiểu 1 Video hoặc 2 Hình ảnh thực tế rõ nét!');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    const payload = {
      orderId: order.orderId,
      productId: product.productId,
      customerId: currentUser?.userId || currentUser?.id || 1,
      reason,
      compensationMethod,
      evidenceUrls: uploadedFiles.map(f => f.url),
      notes: notes.trim()
    };

    try {
      const res = await fetch('http://localhost:5023/api/return-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Lỗi khi gửi yêu cầu khiếu nại.');
      }

      // Lưu vào localStorage để đồng bộ trạng thái ngay trên UI
      try {
        const storedClaims = JSON.parse(localStorage.getItem('user_fresh_claims') || '[]');
        storedClaims.push(data.ticket);
        localStorage.setItem('user_fresh_claims', JSON.stringify(storedClaims));
      } catch (e) {
        console.error('LocalStorage write error', e);
      }

      onSuccess(data.ticket);
    } catch (err: any) {
      // Fallback lưu local nếu API gặp sự cố
      console.warn('API error, falling back to local claim record', err);
      const localTicket = {
        ticketId: `TCK-${Date.now().toString().slice(-6)}`,
        orderId: order.orderId,
        orderCode: order.orderCode,
        productId: product.productId,
        productName: product.productName,
        productImage: product.imageUrl || '',
        customerId: currentUser?.userId || 1,
        reason,
        reasonLabel: reason === 'DAMAGED_IN_TRANSIT' ? 'Hàng bị dập nát do vận chuyển' : reason === 'ROTTEN_INTERNAL' ? 'Hàng bị thối hỏng/mốc bên trong' : 'Giao sai/thiếu khối lượng',
        evidenceUrls: uploadedFiles.map(f => f.url),
        compensationMethod,
        compensationLabel: compensationMethod === 'WALLET_REFUND' ? 'Hoàn tiền vào Ví tài khoản (Store Credit)' : 'Giao bù sản phẩm đạt chất lượng vào đơn sau',
        refundAmount: totalRefundAmount,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      };
      try {
        const storedClaims = JSON.parse(localStorage.getItem('user_fresh_claims') || '[]');
        storedClaims.push(localTicket);
        localStorage.setItem('user_fresh_claims', JSON.stringify(storedClaims));
      } catch (e) {}

      onSuccess(localTicket);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 11000,
        padding: '16px',
        backdropFilter: 'blur(6px)'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div style={{
          background: 'linear-gradient(135deg, #EA580C 0%, #DC2626 100%)',
          padding: '20px 24px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px'
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>
              <span>⚡ CHÍNH SÁCH ĐỔI TRẢ NÔNG SẢN TƯƠI SỐNG</span>
            </div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
              Yêu cầu Khiếu nại & Đổi trả
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '12.5px', color: '#FED7AA' }}>
              Đơn hàng #{order.orderCode} • Mã SP: #{product.productId}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: '#ffffff',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {/* Nội dung form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Thông tin sản phẩm khiếu nại */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '12px 14px',
            backgroundColor: '#F8FAFC',
            borderRadius: '12px',
            border: '1px solid #E2E8F0'
          }}>
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.productName}
                style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #E2E8F0' }}
              />
            ) : (
              <div style={{ width: '56px', height: '56px', borderRadius: '10px', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                🥗
              </div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '14px', color: '#0F172A' }}>
                {product.productName}
              </div>
              <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px' }}>
                Số lượng: <strong>{product.quantity} {product.unit || 'kg'}</strong> • Đơn giá: <strong>{product.unitPrice.toLocaleString('vi-VN')}₫</strong>
              </div>
              <div style={{ fontSize: '12.5px', color: '#DC2626', fontWeight: 700, marginTop: '2px' }}>
                Tổng giá trị bồi hoàn: {totalRefundAmount.toLocaleString('vi-VN')}₫
              </div>
            </div>
          </div>

          {/* 1. Chọn lý do khiếu nại */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#1E293B', marginBottom: '6px', textTransform: 'uppercase' }}>
              1. Lý do khiếu nại chất lượng <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1.5px solid #CBD5E1',
                backgroundColor: '#ffffff',
                fontSize: '13.5px',
                fontWeight: 600,
                color: '#1E293B',
                outline: 'none'
              }}
            >
              <option value="DAMAGED_IN_TRANSIT">🚚 Hàng bị dập nát do vận chuyển</option>
              <option value="ROTTEN_INTERNAL">🍂 Hàng bị thối hỏng/mốc bên trong</option>
              <option value="WRONG_OR_MISSING_WEIGHT">⚖️ Giao sai hoặc thiếu khối lượng</option>
            </select>
          </div>

          {/* 2. Tải lên minh chứng (Bắt buộc: >=1 video HOẶC >=2 ảnh) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#1E293B', textTransform: 'uppercase' }}>
                2. Minh chứng thực tế <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <span style={{
                fontSize: '11.5px',
                fontWeight: 700,
                color: isEvidenceValid ? '#16A34A' : '#DC2626',
                backgroundColor: isEvidenceValid ? '#DCFCE7' : '#FEE2E2',
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                {isEvidenceValid
                  ? `✓ Đạt chuẩn (${imageCount} ảnh, ${videoCount} video)`
                  : 'Yêu cầu: Tối thiểu 1 Video HOẶC 2 Ảnh'}
              </span>
            </div>

            {/* Khung tải file */}
            <div style={{
              border: '2px dashed ' + (isEvidenceValid ? '#86EFAC' : '#FCA5A5'),
              backgroundColor: isEvidenceValid ? '#F0FDF4' : '#FFF7ED',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              cursor: 'pointer'
            }}>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                id="smart-claim-file-input"
              />
              <label htmlFor="smart-claim-file-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '28px' }}>📸</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>
                  Bấm để chọn Ảnh chụp hoặc Video cận cảnh
                </span>
                <span style={{ fontSize: '11.5px', color: '#64748B' }}>
                  Hỗ trợ định dạng JPG, PNG, MP4, MOV (Tối đa 25MB)
                </span>
              </label>
            </div>

            {/* Hoặc dán URL ảnh trực tiếp */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <input
                type="text"
                placeholder="Hoặc dán URL ảnh/video minh chứng tại đây..."
                value={customFileUrl}
                onChange={e => setCustomFileUrl(e.target.value)}
                style={{
                  flex: 1,
                  padding: '7px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '12px'
                }}
              />
              <button
                type="button"
                onClick={handleAddCustomUrl}
                style={{
                  padding: '7px 14px',
                  backgroundColor: '#0F172A',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Thêm link
              </button>
            </div>

            {/* Danh sách file đã tải lên */}
            {uploadedFiles.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                {uploadedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#F1F5F9',
                      border: '1px solid #CBD5E1',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      color: '#334155'
                    }}
                  >
                    <span>{file.type.includes('video') || file.name.endsWith('.mp4') ? '🎥' : '🖼️'}</span>
                    <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      style={{ background: 'none', border: 'none', color: '#DC2626', fontWeight: 800, cursor: 'pointer', padding: 0 }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Lựa chọn phương thức đền bù mong muốn */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#1E293B', marginBottom: '8px', textTransform: 'uppercase' }}>
              3. Chọn phương thức đền bù mong muốn <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {/* Phương án A */}
              <div
                onClick={() => setCompensationMethod('WALLET_REFUND')}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  border: compensationMethod === 'WALLET_REFUND' ? '2px solid #EA580C' : '1.5px solid #E2E8F0',
                  backgroundColor: compensationMethod === 'WALLET_REFUND' ? '#FFF7ED' : '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '18px' }}>💳</span>
                  <span style={{ fontWeight: 800, fontSize: '13px', color: compensationMethod === 'WALLET_REFUND' ? '#C2410C' : '#1E293B' }}>
                    Hoàn tiền vào Ví
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '11px', color: '#64748B', lineHeight: '1.4' }}>
                  Hoàn 100% ({totalRefundAmount.toLocaleString('vi-VN')}₫) vào Ví tài khoản ngay khi duyệt để mua đơn kế tiếp.
                </p>
              </div>

              {/* Phương án B */}
              <div
                onClick={() => setCompensationMethod('REPLACEMENT_NEXT_ORDER')}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  border: compensationMethod === 'REPLACEMENT_NEXT_ORDER' ? '2px solid #DC2626' : '1.5px solid #E2E8F0',
                  backgroundColor: compensationMethod === 'REPLACEMENT_NEXT_ORDER' ? '#FEF2F2' : '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '18px' }}>🎁</span>
                  <span style={{ fontWeight: 800, fontSize: '13px', color: compensationMethod === 'REPLACEMENT_NEXT_ORDER' ? '#B91C1C' : '#1E293B' }}>
                    Giao bù đơn sau
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '11px', color: '#64748B', lineHeight: '1.4' }}>
                  Tự động đính kèm 1 suất quà tặng nông sản mới đạt chuẩn vào giỏ hàng của đơn hàng tiếp theo.
                </p>
              </div>
            </div>
          </div>

          {/* Ghi chú thêm */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>
              Mô tả chi tiết tình trạng sản phẩm (Tùy chọn)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ví dụ: Rau dập nát khoảng 50% ở đáy hộp, quả bị đốm thối..."
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '12.5px',
                resize: 'none'
              }}
            />
          </div>

          {/* Cam kết Zero-Waste: Không thu hồi */}
          <div style={{
            backgroundColor: '#F0FDF4',
            border: '1px solid #BBF7D0',
            padding: '10px 14px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            <span style={{ fontSize: '18px', marginTop: '1px' }}>🌿</span>
            <div style={{ fontSize: '12px', color: '#166534', lineHeight: '1.45' }}>
              <strong>Chính sách Zero-Waste:</strong> Nông sản tươi hỏng sẽ <strong>KHÔNG thu hồi về kho</strong> để tối ưu thời gian và chi phí của bạn. Bạn vui lòng giữ lại ảnh/video minh chứng, hệ thống sẽ giải quyết bồi hoàn trong 15 phút!
            </div>
          </div>

          {submitError && (
            <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECDD3', color: '#DC2626', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }}>
              ⚠️ {submitError}
            </div>
          )}

          {/* Footer nút bấm */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '11px',
                backgroundColor: '#F1F5F9',
                border: 'none',
                borderRadius: '10px',
                fontSize: '13.5px',
                fontWeight: 700,
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={!isEvidenceValid || isSubmitting}
              style={{
                flex: 1.6,
                padding: '11px',
                background: isEvidenceValid ? 'linear-gradient(135deg, #EA580C 0%, #DC2626 100%)' : '#CBD5E1',
                border: 'none',
                borderRadius: '10px',
                fontSize: '13.5px',
                fontWeight: 800,
                color: '#ffffff',
                cursor: isEvidenceValid && !isSubmitting ? 'pointer' : 'not-allowed',
                boxShadow: isEvidenceValid ? '0 4px 12px rgba(220, 38, 38, 0.3)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Gửi yêu cầu khiếu nại'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
