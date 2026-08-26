'use client';
import React from 'react';
import { ICONS } from '../icons';

type TraceabilityTimelineProps = {
  traceSteps: {
    icon: string;
    title: string;
    code: string;
    date: string;
    detail: string;
    lot: string;
  }[];
  activeTrace: number;
  setActiveTrace: (i: number) => void;
};

export const TraceabilityTimeline: React.FC<TraceabilityTimelineProps> = ({
  traceSteps,
  activeTrace,
  setActiveTrace,
}) => {
  return (
    <section className="section" id="trace">
      <div className="wrap">
        <span className="eyebrow">Farm to Table</span>
        <h2 className="section-title" style={{ marginTop: '12px' }}>Theo dấu từng lô hàng — từ hạt giống đến bàn ăn</h2>
        <p className="section-sub">Chạm vào từng mốc để xem chi tiết. Mỗi bước đều được ghi log và gắn liền với mã lô truy xuất riêng.</p>

        <div className="trace-strip">
          {traceSteps.map((s, i) => (
            <button key={s.code} className={`trace-step ${i === activeTrace ? 'active' : ''}`} onClick={() => setActiveTrace(i)}>
              <span className="trace-dot">{ICONS[s.icon]}</span>
              <span className="trace-code">{s.code}</span>
              <h4>{s.title}</h4>
              <span className="t">{s.date}</span>
            </button>
          ))}
        </div>
        
        <div className="trace-detail">
          <div className="stamp">{ICONS[traceSteps[activeTrace].icon]}</div>
          <div>
            <h4>{traceSteps[activeTrace].title} — {traceSteps[activeTrace].date}</h4>
            <p>{traceSteps[activeTrace].detail}</p>
          </div>
          <div className="lot-box"><b>Mã lô truy xuất</b>{traceSteps[activeTrace].lot}<br/>VN-2026 · Nông trại đối tác LÀNH</div>
        </div>
      </div>
    </section>
  );
};
