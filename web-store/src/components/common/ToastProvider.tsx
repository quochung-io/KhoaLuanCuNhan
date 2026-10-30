"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

export interface DialogOptions {
  title?: string;
  message: string;
  type?: ToastType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  showDialog: (options: DialogOptions) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [dialog, setDialog] = useState<DialogOptions | null>(null);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", title?: string, duration: number = 3800) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, title, message, duration }]);

      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const success = useCallback((msg: string, title?: string) => showToast(msg, "success", title), [showToast]);
  const error = useCallback((msg: string, title?: string) => showToast(msg, "error", title), [showToast]);
  const warning = useCallback((msg: string, title?: string) => showToast(msg, "warning", title), [showToast]);
  const info = useCallback((msg: string, title?: string) => showToast(msg, "info", title), [showToast]);

  const showDialog = useCallback((options: DialogOptions) => {
    setDialog(options);
  }, []);

  // Hook override window.alert trên client để xóa sổ triệt để popup "localhost:3000 says"
  useEffect(() => {
    if (typeof window !== "undefined") {
      const originalAlert = window.alert;
      window.alert = (message?: any) => {
        const msgStr = typeof message === "string" ? message : JSON.stringify(message);
        let detectedType: ToastType = "warning";
        const lower = msgStr.toLowerCase();
        if (lower.includes("thành công") || lower.includes("đã thêm") || lower.includes("hoàn tất") || lower.includes("được áp dụng")) {
          detectedType = "success";
        } else if (lower.includes("thất bại") || lower.includes("lỗi") || lower.includes("không thể kết nối") || lower.includes("sai")) {
          detectedType = "error";
        } else if (lower.includes("tạm hết hàng") || lower.includes("hết hạn") || lower.includes("hết hàng") || lower.includes("vui lòng")) {
          detectedType = "warning";
        }

        showDialog({
          title: "Thông báo LÀNH Farm",
          message: msgStr,
          type: detectedType,
          confirmText: "Đã hiểu",
        });
      };

      return () => {
        window.alert = originalAlert;
      };
    }
  }, [showDialog]);

  // Cấu hình style và huy hiệu biểu tượng cho từng loại thông báo
  const getDialogBadge = (type: ToastType = "warning") => {
    switch (type) {
      case "success":
        return {
          bgGrad: "linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)",
          border: "2px solid #22C55E",
          glow: "0 10px 25px -4px rgba(34, 197, 94, 0.35)",
          tagColor: "#15803d",
          tagBg: "#DCFCE7",
          tagText: "THÀNH CÔNG • LÀNH FARM",
          btnGrad: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
          btnShadow: "0 8px 24px rgba(22, 163, 74, 0.4)",
          icon: (
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          ),
        };
      case "error":
        return {
          bgGrad: "linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)",
          border: "2px solid #EF4444",
          glow: "0 10px 25px -4px rgba(239, 68, 68, 0.35)",
          tagColor: "#B91C1C",
          tagBg: "#FEE2E2",
          tagText: "LƯU Ý QUAN TRỌNG",
          btnGrad: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
          btnShadow: "0 8px 24px rgba(220, 38, 38, 0.4)",
          icon: (
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          ),
        };
      case "info":
        return {
          bgGrad: "linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)",
          border: "2px solid #38BDF8",
          glow: "0 10px 25px -4px rgba(14, 165, 233, 0.35)",
          tagColor: "#0369A1",
          tagBg: "#E0F2FE",
          tagText: "TIN TỨC • LÀNH FARM",
          btnGrad: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
          btnShadow: "0 8px 24px rgba(2, 132, 199, 0.4)",
          icon: (
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          ),
        };
      case "warning":
      default:
        return {
          bgGrad: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
          border: "2px solid #F59E0B",
          glow: "0 10px 25px -4px rgba(245, 158, 11, 0.35)",
          tagColor: "#B45309",
          tagBg: "#FEF3C7",
          tagText: "NÔNG SẢN SẠCH LÀNH FARM",
          btnGrad: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
          btnShadow: "0 8px 24px rgba(22, 163, 74, 0.4)",
          icon: (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a9 9 0 0 1 9 9c0 4.97-4.03 9-9 9s-9-4.03-9-9a9 9 0 0 1 9-9z" stroke="#F59E0B" fill="#FFFBEB" fillOpacity="0.4" />
              <path d="M12 7v5" stroke="#D97706" strokeWidth="2.5" />
              <circle cx="12" cy="16" r="1.2" fill="#D97706" />
            </svg>
          ),
        };
    }
  };

  const badge = dialog ? getDialogBadge(dialog.type) : null;

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info, showDialog }}>
      {children}

      {/* DANH SÁCH TOAST NỔI GÓC PHẢI (GLASS-CARD CAO CẤP) */}
      <div
        style={{
          position: "fixed",
          top: "24px",
          right: "24px",
          zIndex: 99999,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          pointerEvents: "none",
          maxWidth: "400px",
          width: "calc(100% - 48px)",
        }}
      >
        {toasts.map((toast) => {
          const typeMap: Record<ToastType, { bg: string; border: string; color: string; iconBg: string; icon: string }> = {
            success: { bg: "#FFFFFF", border: "#86EFAC", color: "#15803D", iconBg: "linear-gradient(135deg, #22C55E, #15803D)", icon: "✓" },
            error: { bg: "#FFFFFF", border: "#FCA5A5", color: "#DC2626", iconBg: "linear-gradient(135deg, #EF4444, #B91C1C)", icon: "✕" },
            warning: { bg: "#FFFFFF", border: "#FCD34D", color: "#B45309", iconBg: "linear-gradient(135deg, #F59E0B, #D97706)", icon: "!" },
            info: { bg: "#FFFFFF", border: "#7DD3FC", color: "#0369A1", iconBg: "linear-gradient(135deg, #0EA5E9, #0284C7)", icon: "i" },
          };
          const tStyle = typeMap[toast.type];

          return (
            <div
              key={toast.id}
              style={{
                pointerEvents: "auto",
                backgroundColor: tStyle.bg,
                border: `1.5px solid ${tStyle.border}`,
                borderRadius: "16px",
                padding: "14px 16px",
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                boxShadow: "0 12px 30px -4px rgba(22, 36, 26, 0.12), 0 4px 10px rgba(0, 0, 0, 0.04)",
                backdropFilter: "blur(12px)",
                position: "relative",
                overflow: "hidden",
              }}
              role="alert"
            >
              {/* Icon tròn nổi bật */}
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "10px",
                  background: tStyle.iconBg,
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "800",
                  fontSize: "14px",
                  flexShrink: 0,
                  boxShadow: "0 4px 10px rgba(0,0,0,0.12)",
                }}
              >
                {tStyle.icon}
              </div>

              {/* Nội dung text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {toast.title && (
                  <div style={{ fontWeight: "700", fontSize: "14px", color: tStyle.color, marginBottom: "3px" }}>
                    {toast.title}
                  </div>
                )}
                <div style={{ fontSize: "13.5px", color: "#334155", lineHeight: "1.5", fontWeight: "500", wordBreak: "break-word" }}>
                  {toast.message}
                </div>
              </div>

              {/* Nút đóng */}
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "6px",
                  border: "none",
                  background: "transparent",
                  color: "#94a3b8",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  flexShrink: 0,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#F1F5F9";
                  e.currentTarget.style.color = "#334155";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#94a3b8";
                }}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>

      {/* MODAL DIALOG CAO CẤP THAY THẾ WINDOW.ALERT TRÌNH DUYỆT */}
      {dialog && badge && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            backgroundColor: "rgba(15, 28, 20, 0.65)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
          onClick={() => {
            dialog.onCancel?.();
            setDialog(null);
          }}
        >
          {/* Card Dialog sang trọng */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "24px",
              boxShadow: "0 25px 60px -12px rgba(15, 42, 20, 0.28), 0 0 0 1px rgba(255, 255, 255, 0.8) inset, 0 10px 25px rgba(0,0,0,0.06)",
              border: "1.5px solid rgba(34, 197, 94, 0.15)",
              maxWidth: "430px",
              width: "100%",
              padding: "36px 30px 28px 30px",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Vệt ánh sáng tỏa nhẹ ở đầu Card */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "10%",
                right: "10%",
                height: "3px",
                background: badge.btnGrad,
                borderRadius: "0 0 10px 10px",
                opacity: 0.9,
              }}
            />

            {/* Nút đóng ✕ góc trên bên phải */}
            <button
              type="button"
              onClick={() => {
                dialog.onCancel?.();
                setDialog(null);
              }}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                border: "1px solid #E2E8F0",
                backgroundColor: "#F8FAFC",
                color: "#64748B",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                fontWeight: "700",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F1F5F9";
                e.currentTarget.style.color = "#0F172A";
                e.currentTarget.style.transform = "rotate(90deg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#F8FAFC";
                e.currentTarget.style.color = "#64748B";
                e.currentTarget.style.transform = "rotate(0deg)";
              }}
              aria-label="Đóng thông báo"
            >
              ✕
            </button>

            {/* Huy hiệu Biểu tượng (Badge Icon) căn giữa tuyệt đối */}
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "22px",
                background: badge.bgGrad,
                border: badge.border,
                boxShadow: badge.glow,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "18px",
                marginTop: "4px",
                transition: "transform 0.3s ease",
              }}
            >
              {badge.icon}
            </div>

            {/* Nhãn Tag nhỏ phong cách LÀNH Farm */}
            <div
              style={{
                display: "inline-block",
                padding: "3px 12px",
                borderRadius: "999px",
                backgroundColor: badge.tagBg,
                color: badge.tagColor,
                fontSize: "11px",
                fontWeight: "700",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              {badge.tagText}
            </div>

            {/* Tiêu đề Modal */}
            <h3
              style={{
                fontSize: "19px",
                fontWeight: "800",
                color: "#16241A",
                margin: "0 0 10px 0",
                fontFamily: "var(--font-display, serif, sans-serif)",
                letterSpacing: "-0.01em",
                lineHeight: "1.3",
              }}
            >
              {dialog.title || "Thông báo từ LÀNH Farm"}
            </h3>

            {/* Nội dung tin nhắn */}
            <p
              style={{
                fontSize: "14.5px",
                color: "#475569",
                margin: "0 0 26px 0",
                lineHeight: "1.65",
                fontWeight: "500",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                maxWidth: "370px",
              }}
            >
              {dialog.message}
            </p>

            {/* Khối Nút Bấm Hành Động */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "center",
                width: "100%",
              }}
            >
              {dialog.cancelText && (
                <button
                  type="button"
                  onClick={() => {
                    dialog.onCancel?.();
                    setDialog(null);
                  }}
                  style={{
                    flex: "1",
                    height: "46px",
                    borderRadius: "14px",
                    border: "1.5px solid #E2E8F0",
                    backgroundColor: "#F8FAFC",
                    color: "#475569",
                    fontWeight: "600",
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#F1F5F9";
                    e.currentTarget.style.color = "#1E293B";
                    e.currentTarget.style.borderColor = "#CBD5E1";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#F8FAFC";
                    e.currentTarget.style.color = "#475569";
                    e.currentTarget.style.borderColor = "#E2E8F0";
                  }}
                >
                  {dialog.cancelText}
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  dialog.onConfirm?.();
                  setDialog(null);
                }}
                style={{
                  flex: dialog.cancelText ? "1.3" : "1",
                  height: "46px",
                  borderRadius: "14px",
                  border: "none",
                  background: badge.btnGrad,
                  color: "#FFFFFF",
                  fontWeight: "700",
                  fontSize: "14.5px",
                  letterSpacing: "0.01em",
                  boxShadow: badge.btnShadow,
                  cursor: "pointer",
                  transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1.5px)";
                  e.currentTarget.style.filter = "brightness(1.06)";
                  e.currentTarget.style.boxShadow = "0 10px 28px rgba(22, 163, 74, 0.48)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.filter = "brightness(1)";
                  e.currentTarget.style.boxShadow = badge.btnShadow;
                }}
              >
                <span>{dialog.confirmText || "Đã hiểu"}</span>
                <span style={{ fontSize: "16px", marginLeft: "2px" }}>✓</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: (msg: string) => {},
      success: (msg: string) => {},
      error: (msg: string) => {},
      warning: (msg: string) => {},
      info: (msg: string) => {},
      showDialog: (opts: DialogOptions) => {},
    };
  }
  return context;
}
