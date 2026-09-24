// Utility quản lý định danh người dùng / Session và gửi nhật ký hành vi về API CARS
export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sid = localStorage.getItem('ecc_session_id');
  if (!sid) {
    sid = 'SES-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    localStorage.setItem('ecc_session_id', sid);
  }
  return sid;
}

export function getCurrentUserId(): number | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('customer_user');
  if (!stored) return null;
  try {
    const user = JSON.parse(stored);
    return user.id || user.userId || null;
  } catch {
    return null;
  }
}

export function trackBehavior(params: {
  productId: number;
  actionType: 'VIEW' | 'QUICK_VIEW' | 'SEARCH' | 'CART' | 'PURCHASE' | 'RECOMMENDATION_CLICK';
  searchKeyword?: string;
  recommendationType?: string;
}) {
  if (typeof window === 'undefined') return;
  if (!params.productId || params.productId <= 0) return;

  const sessionId = getSessionId();
  const userId = getCurrentUserId();

  fetch('http://localhost:5023/api/recommendations/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: userId,
      sessionId: sessionId,
      productId: params.productId,
      actionType: params.actionType,
      searchKeyword: params.searchKeyword || null,
      recommendationType: params.recommendationType || null
    })
  }).catch(() => {
    // Không chặn luồng giao diện nếu track gặp lỗi mạng
  });
}
