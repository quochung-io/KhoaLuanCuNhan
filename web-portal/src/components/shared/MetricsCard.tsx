import React from 'react';
import { Card, Tag, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { Text } = Typography;

export interface MetricsCardProps {
  title: string;
  value: string | number;
  suffix?: string;
  icon: React.ReactNode;
  color?: 'green' | 'blue' | 'purple' | 'orange' | 'red';
  growthRate?: number;
  growthLabel?: string;
  subtitle?: string;
  loading?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const COLOR_MAP = {
  green: { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
  blue: { bg: '#f0f9ff', text: '#0284c7', border: '#bae6fd' },
  purple: { bg: '#f5f3ff', text: '#7c3aed', border: '#ddd6fe' },
  orange: { bg: '#fff7ed', text: '#ea580c', border: '#fed7aa' },
  red: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' }
};

export const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  suffix,
  icon,
  color = 'green',
  growthRate,
  growthLabel = 'so với kỳ trước',
  subtitle,
  loading = false,
  onClick,
  style
}) => {
  const palette = COLOR_MAP[color];

  return (
    <Card
      loading={loading}
      hoverable={Boolean(onClick)}
      onClick={onClick}
      style={{
        borderRadius: 14,
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        border: '1px solid #e2e8f0',
        ...style
      }}
      styles={{ body: { padding: '18px 20px' } }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: palette.text,
              marginTop: 8,
              letterSpacing: '-0.5px'
            }}
          >
            {typeof value === 'number' ? value.toLocaleString('vi-VN') : value}{' '}
            {suffix && <span style={{ fontSize: 14, fontWeight: 600 }}>{suffix}</span>}
          </div>
        </div>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: palette.bg,
            color: palette.text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20
          }}
        >
          {icon}
        </div>
      </div>

      {growthRate !== undefined && (
        <div style={{ marginTop: 12, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          {growthRate >= 0 ? (
            <Tag color="success" style={{ margin: 0, borderRadius: 999, padding: '1px 8px', fontWeight: 600 }}>
              <ArrowUpOutlined /> +{growthRate}%
            </Tag>
          ) : (
            <Tag color="error" style={{ margin: 0, borderRadius: 999, padding: '1px 8px', fontWeight: 600 }}>
              <ArrowDownOutlined /> {growthRate}%
            </Tag>
          )}
          <Text type="secondary" style={{ fontSize: 11.5 }}>
            {growthLabel}
          </Text>
        </div>
      )}

      {subtitle && (
        <div style={{ marginTop: 10, fontSize: 12, color: '#64748b' }}>
          {subtitle}
        </div>
      )}
    </Card>
  );
};
