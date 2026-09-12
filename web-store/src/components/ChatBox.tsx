'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  options?: Array<{ label: string; action: string }>;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    sender: 'bot',
    text: 'Xin chào! Tôi là Trợ lý Tư vấn Nông Sản LÀNH Farm. Rất vui được hỗ trợ bạn hôm nay!',
    time: 'Vừa xong'
  },
  {
    id: 'msg-2',
    sender: 'bot',
    text: 'Bạn đang quan tâm đến vấn đề nào dưới đây? Hãy bấm chọn hoặc gõ câu hỏi nhé:',
    time: 'Vừa xong',
    options: [
      { label: '📦 Kiểm tra tình trạng đơn hàng', action: 'check_order' },
      { label: '🔍 Hướng dẫn truy xuất nguồn gốc QR', action: 'trace_guide' },
      { label: '🚚 Thời gian & Phí giao hàng lạnh', action: 'shipping_info' },
      { label: '🥬 Rau củ VietGAP & Tiêu chuẩn sạch', action: 'vietgap_info' },
      { label: '🔄 Chính sách đổi trả trong 24 giờ', action: 'return_policy' },
      { label: '📞 Kết nối tổng đài viên trực tiếp', action: 'call_hotline' }
    ]
  }
];

function getBotReply(input: string): string {
  const lower = input.toLowerCase().trim();

  if (lower.includes('đơn hàng') || lower.includes('mã đơn') || lower.includes('#dh') || lower.includes('mua')) {
    return 'Để theo dõi tiến độ giao hàng, bạn hãy vào mục "Đơn hàng của tôi" tại menu tài khoản hoặc truy cập trang /orders nhé! Bạn cũng có thể gửi số điện thoại hoặc mã đơn hàng (#DH-...) vào đây để được hỗ trợ kiểm tra tức thì.';
  }

  if (lower.includes('truy xuất') || lower.includes('mã lô') || lower.includes('nguồn gốc') || lower.includes('qr')) {
    return 'Mỗi gói nông sản tại LÀNH đều in mã lô trên tem nhãn. Bạn có thể tra cứu toàn bộ 6 mốc nhật ký từ gieo trồng, kiểm nghiệm nitrat phòng Lab đến xe lạnh tại trang: /traceability.';
  }

  if (lower.includes('giao hàng') || lower.includes('ship') || lower.includes('phí') || lower.includes('mấy tiếng') || lower.includes('2h') || lower.includes('2 giờ')) {
    return 'LÀNH giao hàng bằng chuỗi lạnh FreshLock (4°C – 8°C) trong vòng 2 GIỜ tại nội thành TP.HCM và Hà Nội. Miễn phí vận chuyển cho đơn hàng từ 300.000₫ (phí tiêu chuẩn: 25.000₫).';
  }

  if (lower.includes('đổi trả') || lower.includes('dập') || lower.includes('hỏng') || lower.includes('bảo hành') || lower.includes('khiếu nại')) {
    return 'LÀNH cam kết chính sách ĐỔI TRẢ 1-ĐỔI-1 HOẶC HOÀN TIỀN 100% TRONG 24H nếu nông sản nhận được bị dập nát, héo úa hoặc không đạt độ tươi ngon. Bạn chỉ cần chụp ảnh gói hàng gửi qua hotline hoặc fanpage nhé!';
  }

  if (lower.includes('combo') || lower.includes('tuần') || lower.includes('định kỳ') || lower.includes('tháng')) {
    return 'Gói Combo Định Kỳ của LÀNH được thiết kế theo tuần cho gia đình (3-4 người), giá tiết kiệm hơn 15% so với mua lẻ. Rau củ được thu hoạch vào sáng sớm ngày giao. Bạn có thể xem tại trang: /combos.';
  }

  if (lower.includes('vietgap') || lower.includes('hữu cơ') || lower.includes('an toàn') || lower.includes('thuốc') || lower.includes('hóa chất') || lower.includes('nitrat')) {
    return '100% nông sản tại LÀNH được canh tác không thuốc BVTV độc hại, không phân bón hóa học kích thích và được kiểm nghiệm dư lượng nitrat dưới 45mg/kg trước khi xuất kho.';
  }

  if (lower.includes('hotline') || lower.includes('sđt') || lower.includes('điện thoại') || lower.includes('liên hệ') || lower.includes('gọi')) {
    return 'Hotline chăm sóc khách hàng LÀNH Farm: 1900 8899 (Hỗ trợ từ 7:00 – 21:00 tất cả các ngày trong tuần). Tổng đài viên luôn sẵn sàng giải đáp!';
  }

  if (lower.includes('chào') || lower.includes('hello') || lower.includes('hi')) {
    return 'Chào bạn! LÀNH Farm có thể giúp gì cho bữa ăn gia đình bạn hôm nay?';
  }

  if (lower.includes('cảm ơn') || lower.includes('thank')) {
    return 'Rất vui được hỗ trợ bạn! Chúc bạn và gia đình có những bữa ăn thật ngon miệng và dồi dào sức khỏe cùng nông sản LÀNH!';
  }

  return 'Cảm ơn câu hỏi của bạn! Chuyên viên tư vấn dinh dưỡng của LÀNH Farm đã ghi nhận thông tin và sẽ phản hồi chi tiết cho bạn ngay. Bạn cũng có thể gọi nhanh Hotline 1900 8899 để được giải đáp tức thì nhé!';
}

export default function ChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const [showTooltip, setShowTooltip] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Tự động tắt tooltip sau 6 giây
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  // Đọc lịch sử chat từ localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('lanh_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          setUnreadCount(0);
        }
      }
    } catch (e) {}
  }, []);

  // Cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setUnreadCount(0);
    }
  }, [messages, isOpen, isTyping]);

  const saveMessages = (msgs: Message[]) => {
    setMessages(msgs);
    try {
      localStorage.setItem('lanh_chat_history', JSON.stringify(msgs));
    } catch (e) {}
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const userMsg: Message = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: text,
      time: timeStr
    };

    const newMsgs = [...messages, userMsg];
    saveMessages(newMsgs);
    setInputText('');
    setIsTyping(true);

    // Giả lập bot phản hồi sau 600ms
    setTimeout(() => {
      const replyText = getBotReply(text);
      const botMsg: Message = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'bot',
        text: replyText,
        time: timeStr
      };
      setIsTyping(false);
      saveMessages([...newMsgs, botMsg]);
    }, 650);
  };

  const handleOptionClick = (opt: { label: string; action: string }) => {
    handleSendMessage(opt.label.replace(/^[^\s]+\s/, ''));
  };

  return (
    <>
      {/* ── BONG BÓNG NỔI GÓC DƯỚI BÊN PHẢI (FLOATING BUTTON) ── */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '10px'
      }}>
        {/* Tooltip gợi ý chào mừng */}
        {showTooltip && !isOpen && (
          <div style={{
            backgroundColor: '#1B3A20',
            color: '#FFFFFF',
            padding: '8px 14px',
            borderRadius: '10px',
            fontSize: '12.5px',
            fontWeight: 500,
            boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            maxWidth: '220px',
            lineHeight: 1.4,
            animation: 'fadeIn 0.3s ease'
          }}>
            <span>Bạn cần tư vấn nông sản sạch? Chat ngay!</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(false);
              }}
              style={{
                border: 'none',
                background: 'none',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '14px',
                padding: '0 2px',
                opacity: 0.7
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Nút bấm tròn mở/đóng Chat */}
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            setShowTooltip(false);
          }}
          aria-label="Hỗ trợ trực tuyến"
          style={{
            width: '58px',
            height: '58px',
            borderRadius: '50%',
            backgroundColor: '#2E7D32',
            color: '#FFFFFF',
            border: 'none',
            boxShadow: '0 8px 24px rgba(46, 125, 50, 0.35)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            transition: 'transform 0.2s ease, background-color 0.2s',
            transform: isOpen ? 'rotate(90deg)' : 'scale(1)'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1B5E20')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2E7D32')}
        >
          {isOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          ) : (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          )}

          {/* Badge tin nhắn chưa đọc */}
          {!isOpen && unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              backgroundColor: '#E53E3E',
              color: '#fff',
              fontSize: '11px',
              fontWeight: 800,
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #fff'
            }}>
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* ── CỬA SỔ HỘP THOẠI CHAT (CHAT WINDOW) ── */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '92px',
          right: '24px',
          width: '380px',
          maxWidth: 'calc(100vw - 32px)',
          height: '520px',
          maxHeight: 'calc(100vh - 120px)',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUp 0.25s ease'
        }}>
          {/* HEADER CHAT */}
          <div style={{
            backgroundColor: '#1B3A20',
            color: '#FFFFFF',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#2E7D32',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                color: '#fff',
                fontWeight: 700
              }}>
                L
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14.5px', color: '#fff' }}>
                  Hỗ Trợ Nông Sản LÀNH
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#A7F3D0', marginTop: '2px' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
                  <span>Trực tuyến 24/7 · Phản hồi ngay</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Bạn có muốn xóa lịch sử cuộc trò chuyện này?')) {
                    localStorage.removeItem('lanh_chat_history');
                    setMessages(INITIAL_MESSAGES);
                  }
                }}
                title="Làm mới cuộc trò chuyện"
                style={{
                  border: 'none',
                  background: 'none',
                  color: 'rgba(255,255,255,0.7)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '4px'
                }}
              >
                ↺
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Đóng cửa sổ chat"
                style={{
                  border: 'none',
                  background: 'none',
                  color: 'rgba(255,255,255,0.85)',
                  cursor: 'pointer',
                  fontSize: '18px',
                  padding: '4px'
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* NỘI DUNG TIN NHẮN (MESSAGES BODY) */}
          <div style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            backgroundColor: '#F8FAFC',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {messages.map((msg) => {
              const isBot = msg.sender === 'bot';
              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isBot ? 'flex-start' : 'flex-end'
                  }}
                >
                  <div style={{
                    maxWidth: '82%',
                    backgroundColor: isBot ? '#FFFFFF' : '#2E7D32',
                    color: isBot ? '#1E293B' : '#FFFFFF',
                    padding: '10px 14px',
                    borderRadius: isBot ? '14px 14px 14px 2px' : '14px 14px 2px 14px',
                    fontSize: '13px',
                    lineHeight: 1.5,
                    boxShadow: isBot ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                    border: isBot ? '1px solid #E2E8F0' : 'none',
                    wordBreak: 'break-word'
                  }}>
                    {msg.text}
                  </div>

                  {/* Nút gợi ý câu hỏi (nếu có) */}
                  {isBot && msg.options && msg.options.length > 0 && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      marginTop: '8px',
                      width: '100%',
                      maxWidth: '90%'
                    }}>
                      {msg.options.map((opt, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleOptionClick(opt)}
                          style={{
                            padding: '7px 12px',
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #CBD5E1',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#1B3A20',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.15s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#E8F5E9';
                            e.currentTarget.style.borderColor = '#2E7D32';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#FFFFFF';
                            e.currentTarget.style.borderColor = '#CBD5E1';
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <span style={{
                    fontSize: '10.5px',
                    color: '#94A3B8',
                    marginTop: '4px',
                    padding: '0 4px'
                  }}>
                    {msg.time}
                  </span>
                </div>
              );
            })}

            {/* Hiệu ứng đang gõ tin nhắn */}
            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', backgroundColor: '#FFFFFF', borderRadius: '12px', width: 'fit-content', border: '1px solid #E2E8F0' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2E7D32', animation: 'bounce 1s infinite' }} />
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2E7D32', animation: 'bounce 1s infinite 0.2s' }} />
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2E7D32', animation: 'bounce 1s infinite 0.4s' }} />
                <style>{`
                  @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                  }
                `}</style>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* FOOTER: THANH NHẬP TIN NHẮN */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              padding: '12px 14px',
              backgroundColor: '#FFFFFF',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Nhập câu hỏi cần hỗ trợ..."
              style={{
                flex: 1,
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '9px 12px',
                fontSize: '13px',
                outline: 'none',
                color: '#1E293B',
                backgroundColor: '#F8FAFC'
              }}
              onFocus={(e) => (e.target.style.borderColor = '#2E7D32')}
              onBlur={(e) => (e.target.style.borderColor = '#CBD5E1')}
            />

            <button
              type="submit"
              aria-label="Gửi tin nhắn"
              style={{
                padding: '9px 14px',
                backgroundColor: '#2E7D32',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '13px',
                transition: 'background-color 0.2s'
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
