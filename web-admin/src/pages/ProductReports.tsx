import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Table,
  Card,
  Row,
  Col,
  Statistic,
  DatePicker,
  Select,
  Input,
  Button,
  Tag,
  Space,
  Tooltip,
  Radio,
  Progress,
  Modal,
  Drawer,
  Badge,
  message,
  Typography,
  Tabs,
  Alert,
  Segmented,
  AutoComplete
} from 'antd';
import {
  SearchOutlined,
  DownloadOutlined,
  ReloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  InboxOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  RollbackOutlined,
  EyeOutlined,
  LineChartOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  ExportOutlined,
  PieChartOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import {
  TrendingUp,
  Sparkles,
  Layers,
  Flame,
  Award
} from 'lucide-react';
import dayjs, { Dayjs } from 'dayjs';
import { reportService, categoryService, productBatchService, userService, productService } from '../services/api';

const { RangePicker } = DatePicker;
const { Text, Title } = Typography;

interface ProductReportItem {
  productId: number;
  sku: string;
  productName: string;
  categoryId: number;
  categoryName: string;
  supplierId?: number;
  supplierName?: string;
  unit: string;
  price: number;
  status: string;
  currentStock: number;
  batchesCount: number;
  stockStatus: string; // InStock | LowStock | OutOfStock
  soldQuantity: number;
  totalRevenue: number;
  ordersCount: number;
  revenueGrowthRate: number;
  soldQuantityGrowthRate: number;
}

interface SummaryData {
  totalRevenue: number;
  prevTotalRevenue: number;
  revenueGrowthRate: number;
  totalSoldQuantity: number;
  prevTotalSoldQuantity: number;
  soldQuantityGrowthRate: number;
  totalStock: number;
  returnedOrdersCount: number;
  returnedRevenue: number;
  returnedQuantity: number;
  totalProductsCount: number;
}

interface PeriodInfo {
  timeRange: string;
  label: string;
  startDate: string;
  endDate: string;
  prevStartDate: string;
  prevEndDate: string;
}

export const ProductReports: React.FC = () => {
  // Filters state
  const [timeRange, setTimeRange] = useState<string>('thisMonth');
  const [customDates, setCustomDates] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [search, setSearch] = useState<string>('');
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [supplierFilter, setSupplierFilter] = useState<number | 'all'>('all');
  const [stockFilter, setStockFilter] = useState<string>('ALL');
  const [businessStatus, setBusinessStatus] = useState<string>('ALL');
  const [salesFilter, setSalesFilter] = useState<string>('all');

  // Pagination & Sorting state
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortBy, setSortBy] = useState<string>('revenue');
  const [sortOrder, setSortOrder] = useState<string>('desc');

  // Data states
  const [loading, setLoading] = useState<boolean>(false);
  const [exporting, setExporting] = useState<boolean>(false);
  const [items, setItems] = useState<ProductReportItem[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [period, setPeriod] = useState<PeriodInfo | null>(null);
  const [topSelling, setTopSelling] = useState<any[]>([]);
  const [topRevenue, setTopRevenue] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);

  // Advanced Chart Visualizations States
  const [chartActiveTab, setChartActiveTab] = useState<string>('trend');
  const [trendMode, setTrendMode] = useState<'all' | 'revenue' | 'quantity'>('all');
  const [categoryChartType, setCategoryChartType] = useState<'revenue' | 'quantity'>('revenue');
  const [topRankingType, setTopRankingType] = useState<'revenue' | 'quantity'>('revenue');
  const [categoryDistribution, setCategoryDistribution] = useState<any[]>([]);
  const [stockStatusDistribution, setStockStatusDistribution] = useState<any[]>([]);

  // Categories & Suppliers list
  const [categories, setCategories] = useState<{ categoryId: number; categoryName: string }[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);

  // Batch details drilldown modal for a single product
  const [selectedProduct, setSelectedProduct] = useState<ProductReportItem | null>(null);
  const [batchModalOpen, setBatchModalOpen] = useState<boolean>(false);
  const [productBatches, setProductBatches] = useState<any[]>([]);
  const [batchLoading, setBatchLoading] = useState<boolean>(false);
  const [batchSearch, setBatchSearch] = useState<string>('');

  // Drilldown Drawer State (Cho 4 thẻ KPI)
  const [drilldownType, setDrilldownType] = useState<'revenue' | 'sold' | 'inventory' | 'returns' | null>(null);
  const [drilldownLoading, setDrilldownLoading] = useState<boolean>(false);
  const [drilldownData, setDrilldownData] = useState<any>(null);
  const [inventoryTabFilter, setInventoryTabFilter] = useState<string>('all');
  const [drillSearch, setDrillSearch] = useState<string>('');

  // Load Categories, Suppliers & All Products on mount
  useEffect(() => {
    Promise.all([
      categoryService.getAll().catch(() => ({ data: [] })),
      userService.getSuppliers().catch(() => ({ data: [] })),
      productService.getAll().catch(() => ({ data: [] })),
    ]).then(([catRes, supRes, prodRes]) => {
      setCategories(catRes.data || []);
      const supList = supRes.data || [];
      setSuppliers(supList.length > 0 ? supList : [
        { supplierId: 1, userId: 2, fullName: 'Hợp tác xã Nông Sản Đà Lạt' },
        { supplierId: 2, userId: 3, fullName: 'Hợp tác xã Rau Sạch Miền Tây' },
        { supplierId: 3, userId: 4, fullName: 'Hợp tác xã Trái Cây Việt' }
      ]);
      setAllProducts(prodRes.data || []);
    });
  }, []);

  // Helper loại bỏ dấu tiếng Việt để tìm kiếm không phân biệt có/không dấu
  const removeVietnameseTones = useCallback((str: string) => {
    if (!str) return '';
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase();
  }, []);

  // Danh sách gợi ý tìm kiếm thời gian thực (Autocomplete Suggestions) khi người dùng gõ ký tự (ví dụ: chữ 'c', 'C', '#10'...)
  const searchSuggestions = useMemo(() => {
    if (!search || !search.trim()) return [];

    const rawQ = search.trim();
    const qLower = rawQ.toLowerCase();
    const qNorm = removeVietnameseTones(rawQ);
    const cleanIdStr = qLower.replace(/^(#|id\s*:?\s*|sp\s*:?\s*|mã\s*:?\s*)/i, '').trim();

    const matched = allProducts.filter((p: any) => {
      const pIdStr = String(p.productId || '');
      // 1. Khớp theo ID
      if (cleanIdStr && pIdStr === cleanIdStr) return true;
      if (cleanIdStr && pIdStr.includes(cleanIdStr)) return true;
      if (('#' + pIdStr).includes(qLower)) return true;

      // 2. Khớp theo Tên sản phẩm (không phân biệt HOA/thường, hỗ trợ cả tiếng Việt không dấu)
      const name = p.productName || '';
      if (name.toLowerCase().includes(qLower)) return true;
      if (removeVietnameseTones(name).includes(qNorm)) return true;

      // 3. Khớp SKU
      if ((p.sku || '').toLowerCase().includes(qLower)) return true;

      // 4. Khớp Danh mục
      const catName = p.categoryName || p.category?.categoryName || '';
      if (catName.toLowerCase().includes(qLower)) return true;
      if (removeVietnameseTones(catName).includes(qNorm)) return true;

      return false;
    });

    // Tạo danh sách Option đẹp mắt cho AutoComplete (tối đa 12 gợi ý phù hợp nhất)
    return matched.slice(0, 12).map((p: any) => {
      const pId = p.productId;
      const pName = p.productName;
      const catName = p.categoryName || p.category?.categoryName || 'Nông sản';

      return {
        value: pName,
        key: `suggest-${pId}`,
        label: (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
            <Space size={8}>
              <Tag color="purple" style={{ fontWeight: 700, margin: 0, fontSize: 11 }}>
                #{pId}
              </Tag>
              <span style={{ fontWeight: 600, color: '#1B5E20' }}>
                {pName}
              </span>
              <Tag color="cyan" style={{ fontSize: 11, margin: 0, padding: '0 4px' }}>
                {catName}
              </Tag>
            </Space>
            <span style={{ fontSize: 12, color: '#888' }}>
              {p.unit ? `Đơn vị: ${p.unit}` : ''}
            </span>
          </div>
        ),
      };
    });
  }, [search, allProducts, removeVietnameseTones]);

  // Reset filters handler
  const handleResetFilters = () => {
    setSearch('');
    setCategoryId(undefined);
    setSupplierFilter('all');
    setStockFilter('ALL');
    setBusinessStatus('ALL');
    setSalesFilter('all');
    setTimeRange('thisMonth');
    setCustomDates(null);
    setPage(1);
  };

  // Helper tìm tên nhà cung cấp
  const getSupplierName = useCallback((supId?: number) => {
    if (!supId) return 'Hợp tác xã Nông sản';
    const s = suppliers.find((x: any) => x.supplierId === supId || x.userId === supId);
    return s?.fullName || s?.supplierName || `Nhà cung cấp #${supId}`;
  }, [suppliers]);

  // Fetch report data with server-side filtering and pagination
  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        timeRange,
        page,
        pageSize,
        sortBy,
        sortOrder,
      };

      if (timeRange === 'custom' && customDates && customDates[0] && customDates[1]) {
        params.startDate = customDates[0].format('YYYY-MM-DD');
        params.endDate = customDates[1].format('YYYY-MM-DD');
      }

      if (categoryId) params.categoryId = categoryId;
      if (supplierFilter !== 'all') params.supplierId = supplierFilter;
      if (businessStatus && businessStatus !== 'ALL') params.status = businessStatus;
      if (stockFilter && stockFilter !== 'ALL') params.stockStatus = stockFilter;
      if (salesFilter && salesFilter !== 'all') params.performance = salesFilter;
      if (search.trim()) params.search = search.trim();

      const res = await reportService.getProductReports(params);
      const data = res.data;

      setItems(data.items || []);
      setSummary(data.summary);
      setPeriod(data.period);
      setTopSelling(data.topSelling || []);
      setTopRevenue(data.topRevenue || []);
      setTrendData(data.trend || []);
      setTotalItems(data.pagination?.totalItems || 0);
      setCategoryDistribution(data.categoryDistribution || []);
      setStockStatusDistribution(data.stockStatusDistribution || []);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không thể tải báo cáo sản phẩm.');
    } finally {
      setLoading(false);
    }
  }, [timeRange, customDates, categoryId, supplierFilter, businessStatus, stockFilter, salesFilter, search, page, pageSize, sortBy, sortOrder]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // ── Smart Insights computation ──
  const peakStats = useMemo(() => {
    if (!trendData || trendData.length === 0) {
      return { peakRevDay: null, peakQtyDay: null, avgRevPerDay: 0, activeDays: 0, topCategory: null };
    }
    const revSorted = [...trendData].sort((a, b) => (b.revenue || 0) - (a.revenue || 0));
    const qtySorted = [...trendData].sort((a, b) => (b.quantity || 0) - (a.quantity || 0));
    const activeDays = trendData.filter((d: any) => (d.revenue || 0) > 0 || (d.quantity || 0) > 0).length;
    const totalRev = trendData.reduce((acc: number, d: any) => acc + (d.revenue || 0), 0);
    const avgRev = trendData.length > 0 ? totalRev / trendData.length : 0;
    const topCat = categoryDistribution && categoryDistribution.length > 0 ? categoryDistribution[0] : null;

    return {
      peakRevDay: revSorted[0] && revSorted[0].revenue > 0 ? revSorted[0] : null,
      peakQtyDay: qtySorted[0] && qtySorted[0].quantity > 0 ? qtySorted[0] : null,
      avgRevPerDay: avgRev,
      activeDays,
      topCategory: topCat,
    };
  }, [trendData, categoryDistribution]);

  // ── 1. ECharts: Xu hướng Bán hàng & Doanh thu Đa chiều (Dual-Axis Spline + Rounded Bar) ──
  const getTrendOption = useCallback((mode: 'all' | 'revenue' | 'quantity') => {
    const dates = trendData.map((d: any) => d.date);
    const revenues = trendData.map((d: any) => d.revenue);
    const quantities = trendData.map((d: any) => d.quantity);

    const series: any[] = [];

    if (mode === 'all' || mode === 'revenue') {
      series.push({
        name: 'Doanh thu (₫)',
        type: 'line',
        yAxisIndex: 0,
        smooth: 0.35,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#10B981',
          borderColor: '#ffffff',
          borderWidth: 2,
          shadowColor: 'rgba(16, 185, 129, 0.4)',
          shadowBlur: 6,
        },
        lineStyle: {
          width: 3.5,
          color: '#10B981',
          shadowColor: 'rgba(16, 185, 129, 0.35)',
          shadowBlur: 10,
          shadowOffsetY: 5,
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(16, 185, 129, 0.38)' },
            { offset: 0.8, color: 'rgba(16, 185, 129, 0.05)' },
            { offset: 1, color: 'rgba(16, 185, 129, 0.00)' },
          ]),
        },
        data: revenues,
      });
    }

    if (mode === 'all' || mode === 'quantity') {
      series.push({
        name: 'Sản lượng bán (SP)',
        type: 'bar',
        yAxisIndex: mode === 'quantity' ? 0 : 1,
        barMaxWidth: 26,
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#3B82F6' },
            { offset: 1, color: '#93C5FD' },
          ]),
          shadowColor: 'rgba(59, 130, 246, 0.25)',
          shadowBlur: 6,
        },
        data: quantities,
      });
    }

    return {
      backgroundColor: 'transparent',
      grid: {
        top: 45,
        left: 20,
        right: mode === 'all' ? 25 : 15,
        bottom: 50,
        containLabel: true,
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        borderColor: '#E2E8F0',
        borderWidth: 1,
        padding: [12, 16],
        textStyle: { color: '#1E293B', fontSize: 13 },
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowBlur: 16,
        axisPointer: {
          type: 'cross',
          crossStyle: { color: '#94A3B8' },
          lineStyle: { color: '#CBD5E1', type: 'dashed' },
        },
        formatter: (params: any[]) => {
          if (!params || params.length === 0) return '';
          const date = params[0].axisValue;
          let content = `<div style="font-weight:700;margin-bottom:8px;color:#0F172A;border-bottom:1px solid #F1F5F9;padding-bottom:4px;">📅 Ngày: ${date}</div>`;
          params.forEach((p: any) => {
            const isRev = p.seriesName.includes('Doanh thu');
            const valFormatted = isRev
              ? `${Number(p.value).toLocaleString('vi-VN')} ₫`
              : `${p.value} SP`;
            content += `<div style="display:flex;align-items:center;justify-content:space-between;gap:16px;margin:4px 0;">
              <span style="display:flex;align-items:center;gap:6px;">
                <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p.color?.colorStops ? p.color.colorStops[0].color : p.color};"></span>
                <span>${p.seriesName}</span>
              </span>
              <strong style="color:${isRev ? '#10B981' : '#3B82F6'};">${valFormatted}</strong>
            </div>`;
          });
          return content;
        },
      },
      legend: {
        top: 6,
        right: 110,
        textStyle: { color: '#475569', fontWeight: 500, fontSize: 12 },
        icon: 'roundRect',
      },
      toolbox: {
        top: 4,
        right: 10,
        feature: {
          magicType: { type: ['line', 'bar'] },
          saveAsImage: { title: 'Tải biểu đồ HD' },
        },
        iconStyle: { borderColor: '#64748B' },
      },
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100,
        },
        {
          type: 'slider',
          bottom: 4,
          height: 18,
          borderColor: '#E2E8F0',
          fillerColor: 'rgba(16, 185, 129, 0.15)',
          handleStyle: { color: '#10B981' },
          textStyle: { color: '#94A3B8', fontSize: 10 }
        }
      ],
      xAxis: {
        type: 'category',
        data: dates,
        axisLine: { lineStyle: { color: '#CBD5E1' } },
        axisLabel: { color: '#64748B', fontSize: 11, fontWeight: 500 },
        axisTick: { show: false },
      },
      yAxis: [
        {
          type: 'value',
          name: 'Doanh thu',
          nameTextStyle: { color: '#10B981', fontWeight: 600, fontSize: 11, padding: [0, 0, 4, 0] },
          axisLabel: {
            color: '#64748B',
            fontSize: 11,
            formatter: (v: number) => {
              if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
              if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
              return `${v}`;
            },
          },
          splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } },
        },
        ...(mode === 'all'
          ? [
              {
                type: 'value',
                name: 'Sản lượng',
                nameTextStyle: { color: '#3B82F6', fontWeight: 600, fontSize: 11, padding: [0, 0, 4, 0] },
                axisLabel: { color: '#64748B', fontSize: 11, formatter: '{value} SP' },
                splitLine: { show: false },
              },
            ]
          : []),
      ],
      series,
    };
  }, [trendData]);

  // ── 2. ECharts: Donut Cơ cấu Doanh thu & Sản lượng theo Danh mục ──
  const getCategoryDonutOption = useCallback((type: 'revenue' | 'quantity') => {
    const isRev = type === 'revenue';
    const data = (categoryDistribution || []).map((cat: any) => ({
      name: cat.name,
      value: isRev ? cat.revenue : cat.soldQuantity,
      productsCount: cat.productsCount,
      stock: cat.stock,
    }));

    const colors = [
      '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899', 
      '#06B6D4', '#14B8A6', '#F97316', '#6366F1'
    ];

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        borderColor: '#E2E8F0',
        borderWidth: 1,
        padding: [10, 14],
        textStyle: { color: '#1E293B', fontSize: 13 },
        shadowColor: 'rgba(0,0,0,0.1)',
        shadowBlur: 12,
        formatter: (params: any) => {
          const valFormatted = isRev
            ? `${Number(params.value).toLocaleString('vi-VN')} ₫`
            : `${params.value} SP`;
          const percent = params.percent || 0;
          return `
            <div style="font-weight:700;color:#0F172A;margin-bottom:6px;">${params.marker} ${params.name}</div>
            <div style="display:flex;justify-content:space-between;gap:16px;margin:2px 0;">
              <span style="color:#64748B;">${isRev ? 'Doanh thu' : 'Số lượng bán'}:</span>
              <strong style="color:${params.color};">${valFormatted}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;gap:16px;margin:2px 0;">
              <span style="color:#64748B;">Tỷ trọng đóng góp:</span>
              <strong>${percent}%</strong>
            </div>
            <div style="display:flex;justify-content:space-between;gap:16px;margin:2px 0;font-size:11px;color:#888;">
              <span>Số loại sản phẩm:</span>
              <span>${params.data.productsCount} mặt hàng</span>
            </div>
          `;
        },
      },
      legend: {
        orient: 'vertical',
        right: 15,
        top: 'center',
        textStyle: { color: '#475569', fontSize: 12 },
        itemGap: 12,
      },
      color: colors,
      series: [
        {
          name: isRev ? 'Doanh thu' : 'Sản lượng',
          type: 'pie',
          radius: ['45%', '72%'],
          center: ['36%', '50%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#ffffff',
            borderWidth: 3,
            shadowColor: 'rgba(0, 0, 0, 0.08)',
            shadowBlur: 8,
          },
          label: {
            show: true,
            position: 'outside',
            formatter: '{b}\n{d}%',
            color: '#475569',
            fontSize: 11,
            fontWeight: 600,
          },
          labelLine: {
            length: 12,
            length2: 14,
            smooth: true,
            lineStyle: { width: 1.5, color: '#CBD5E1' }
          },
          emphasis: {
            scale: true,
            scaleSize: 8,
            label: {
              show: true,
              fontSize: 13,
              fontWeight: 'bold',
            },
          },
          data: data.length > 0 ? data : [{ name: 'Chưa có dữ liệu', value: 0 }],
        },
      ],
    };
  }, [categoryDistribution]);

  // ── 3. ECharts: Xếp hạng Top 5 Nông Sản (Horizontal Bar with Podium Gradients) ──
  const getTopRankingOption = useCallback((type: 'revenue' | 'quantity') => {
    const isRev = type === 'revenue';
    const rawList = isRev ? topRevenue : topSelling;
    const list = [...rawList].slice(0, 5).reverse();

    const names = list.map((i: any) => i.productName);
    const values = list.map((i: any) => (isRev ? i.totalRevenue : i.soldQuantity));

    return {
      backgroundColor: 'transparent',
      grid: {
        top: 25,
        left: 140,
        right: 70,
        bottom: 20,
        containLabel: false,
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        borderColor: '#E2E8F0',
        formatter: (params: any[]) => {
          const item = params[0];
          const val = isRev ? `${Number(item.value).toLocaleString('vi-VN')} ₫` : `${item.value} SP`;
          return `<strong>${item.name}</strong><br/>${isRev ? 'Doanh thu' : 'Đã bán'}: <span style="color:#F59E0B;font-weight:700;">${val}</span>`;
        },
      },
      xAxis: {
        type: 'value',
        axisLabel: {
          formatter: (v: number) => (isRev ? `${(v / 1000).toFixed(0)}k` : `${v}`),
          color: '#64748B',
        },
        splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } },
      },
      yAxis: {
        type: 'category',
        data: names,
        axisLabel: {
          color: '#1E293B',
          fontWeight: 600,
          fontSize: 12,
          formatter: (name: string, index: number) => {
            const rank = list.length - index;
            const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
            return `${medal} ${name.length > 15 ? name.substring(0, 14) + '...' : name}`;
          },
        },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      series: [
        {
          type: 'bar',
          barMaxWidth: 22,
          data: values.map((val: number, idx: number) => {
            const rank = list.length - idx;
            let gradient = ['#3B82F6', '#60A5FA'];
            if (rank === 1) gradient = ['#F59E0B', '#FCD34D']; // Gold
            else if (rank === 2) gradient = ['#64748B', '#94A3B8']; // Silver
            else if (rank === 3) gradient = ['#D97706', '#FBBF24']; // Bronze
            else gradient = ['#10B981', '#34D399'];

            return {
              value: val,
              itemStyle: {
                borderRadius: [0, 6, 6, 0],
                color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                  { offset: 0, color: gradient[0] },
                  { offset: 1, color: gradient[1] },
                ]),
              },
            };
          }),
          label: {
            show: true,
            position: 'right',
            formatter: (p: any) => (isRev ? `${Number(p.value).toLocaleString('vi-VN')}₫` : `${p.value}`),
            color: '#475569',
            fontWeight: 600,
            fontSize: 11,
          },
        },
      ],
    };
  }, [topRevenue, topSelling]);

  // ── 4. ECharts: Sức khỏe Tồn kho & Đánh giá Rủi ro FEFO ──
  const getInventoryHealthOption = useCallback(() => {
    const data = (stockStatusDistribution || []).map((s: any) => ({
      name: s.status,
      value: s.count,
      itemStyle: { color: s.color },
    }));

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        formatter: '{b}: <b>{c}</b> sản phẩm ({d}%)',
      },
      legend: {
        bottom: 8,
        left: 'center',
        textStyle: { color: '#475569', fontSize: 12 },
      },
      series: [
        {
          name: 'Trạng thái tồn kho',
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['50%', '45%'],
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: '{b}\n{c} SP ({d}%)',
            color: '#334155',
            fontSize: 11,
            fontWeight: 600,
          },
          data: data.length > 0 ? data : [{ name: 'Không có dữ liệu', value: 0 }],
        },
      ],
    };
  }, [stockStatusDistribution]);

  // Handler mở Drilldown Drawer chi tiết khi bấm vào từng thẻ KPI
  const handleOpenDrilldown = async (type: 'revenue' | 'sold' | 'inventory' | 'returns') => {
    setDrilldownType(type);
    setDrilldownLoading(true);
    setDrilldownData(null);
    setInventoryTabFilter('all');

    try {
      const params: any = { timeRange };
      if (timeRange === 'custom' && customDates && customDates[0] && customDates[1]) {
        params.startDate = customDates[0].format('YYYY-MM-DD');
        params.endDate = customDates[1].format('YYYY-MM-DD');
      }

      let res;
      if (type === 'revenue') {
        res = await reportService.getRevenueDrilldown(params);
      } else if (type === 'sold') {
        res = await reportService.getSoldDrilldown(params);
      } else if (type === 'inventory') {
        res = await reportService.getInventoryDrilldown();
      } else if (type === 'returns') {
        res = await reportService.getReturnsDrilldown(params);
      }

      if (res && res.data) {
        setDrilldownData(res.data);
      }
    } catch {
      message.error('Không thể tải dữ liệu chi tiết cho phân hệ này.');
    } finally {
      setDrilldownLoading(false);
    }
  };

  // Export CSV handler
  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const params: any = { timeRange };
      if (timeRange === 'custom' && customDates && customDates[0] && customDates[1]) {
        params.startDate = customDates[0].format('YYYY-MM-DD');
        params.endDate = customDates[1].format('YYYY-MM-DD');
      }
      if (categoryId) params.categoryId = categoryId;
      if (supplierFilter !== 'all') params.supplierId = supplierFilter;
      if (businessStatus && businessStatus !== 'ALL') params.status = businessStatus;
      if (stockFilter && stockFilter !== 'ALL') params.stockStatus = stockFilter;
      if (salesFilter && salesFilter !== 'all') params.performance = salesFilter;
      if (search.trim()) params.search = search.trim();

      const res = await reportService.exportProductReports(params);
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `BaoCao_SanPham_TonKho_${dayjs().format('YYYYMMDD_HHmmss')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      message.success('Xuất file báo cáo thành công!');
    } catch {
      message.error('Lỗi khi xuất file báo cáo.');
    } finally {
      setExporting(false);
    }
  };

  // View batch drilldown for a single product
  const handleViewBatches = async (product: ProductReportItem) => {
    setSelectedProduct(product);
    setBatchSearch('');
    setBatchModalOpen(true);
    setBatchLoading(true);
    try {
      const res = await productBatchService.getAll();
      const allBatches = res.data || [];
      const filtered = allBatches.filter((b: any) => b.productId === product.productId);
      setProductBatches(filtered);
    } catch {
      message.error('Không thể tải danh sách lô hàng của sản phẩm.');
    } finally {
      setBatchLoading(false);
    }
  };

  // Helper render Growth indicator
  const renderGrowthTag = (rate: number) => {
    if (rate > 0) {
      return (
        <Tag color="success" icon={<ArrowUpOutlined />}>
          +{rate}%
        </Tag>
      );
    } else if (rate < 0) {
      return (
        <Tag color="error" icon={<ArrowDownOutlined />}>
          {rate}%
        </Tag>
      );
    }
    return <Tag color="default">0%</Tag>;
  };

  // Table columns definition with comprehensive sorters and all attributes
  const columns = [
    {
      title: 'Mã ID / SKU',
      key: 'productId',
      width: 140,
      sorter: (a: ProductReportItem, b: ProductReportItem) => a.productId - b.productId,
      render: (_: any, record: ProductReportItem) => (
        <Space direction="vertical" size={2}>
          <Tag color="purple" style={{ fontWeight: 700, margin: 0 }}>#{record.productId}</Tag>
          <Tag color="geekblue" style={{ fontFamily: 'monospace', fontSize: 11, margin: 0 }}>{record.sku}</Tag>
        </Space>
      ),
    },
    {
      title: 'Tên Sản Phẩm',
      dataIndex: 'productName',
      key: 'productName',
      sorter: (a: ProductReportItem, b: ProductReportItem) => a.productName.localeCompare(b.productName),
      render: (name: string, record: ProductReportItem) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1B5E20' }}>{name}</div>
          <div style={{ fontSize: 12, color: '#888' }}>
            <Tag color="cyan" style={{ fontSize: 11, padding: '0 4px', marginRight: 4 }}>{record.categoryName}</Tag>
            Đơn vị: <strong>{record.unit}</strong>
          </div>
        </div>
      ),
    },
    {
      title: 'Nhà Cung Cấp / HTX',
      key: 'supplierName',
      width: 180,
      sorter: (a: ProductReportItem, b: ProductReportItem) => {
        const nameA = a.supplierName || getSupplierName(a.supplierId);
        const nameB = b.supplierName || getSupplierName(b.supplierId);
        return nameA.localeCompare(nameB);
      },
      render: (_: any, record: ProductReportItem) => {
        const sName = record.supplierName || getSupplierName(record.supplierId);
        return (
          <Space direction="vertical" size={2}>
            <span style={{ fontWeight: 600, color: '#0958d9', fontSize: 13 }}>
              🏢 {sName}
            </span>
            {record.supplierId ? (
              <span style={{ fontSize: 11, color: '#888' }}>Mã HTX: #{record.supplierId}</span>
            ) : null}
          </Space>
        );
      },
    },
    {
      title: 'Đơn Giá',
      dataIndex: 'price',
      key: 'price',
      width: 130,
      sorter: (a: ProductReportItem, b: ProductReportItem) => a.price - b.price,
      render: (price: number, record: ProductReportItem) => (
        <strong style={{ color: '#2e7d32', fontSize: 13 }}>
          {price.toLocaleString('vi-VN')} ₫ <span style={{ fontSize: 11, color: '#888', fontWeight: 'normal' }}>/{record.unit}</span>
        </strong>
      ),
    },
    {
      title: 'Tồn Kho Hiện Tại',
      dataIndex: 'currentStock',
      key: 'currentStock',
      sorter: (a: ProductReportItem, b: ProductReportItem) => a.currentStock - b.currentStock,
      render: (stock: number, record: ProductReportItem) => {
        let badgeStatus: 'success' | 'warning' | 'error' = 'success';
        let statusText = 'Còn hàng';
        if (stock <= 0) {
          badgeStatus = 'error';
          statusText = 'Hết hàng (OutOfStock)';
        } else if (stock <= 20) {
          badgeStatus = 'warning';
          statusText = 'Sắp hết (LowStock)';
        }

        return (
          <div>
            <Space size={6}>
              <Badge status={badgeStatus} />
              <strong style={{ fontSize: 14, color: stock <= 0 ? '#ff4d4f' : '#333' }}>
                {stock.toLocaleString('vi-VN')} {record.unit}
              </strong>
            </Space>
            <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
              {statusText} · {record.batchesCount} lô hàng
            </div>
          </div>
        );
      },
    },
    {
      title: 'Đã Bán Trong Kỳ',
      dataIndex: 'soldQuantity',
      key: 'soldQuantity',
      sorter: (a: ProductReportItem, b: ProductReportItem) => a.soldQuantity - b.soldQuantity,
      render: (qty: number, record: ProductReportItem) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: qty > 0 ? '#1890ff' : '#999' }}>
            {qty.toLocaleString('vi-VN')} {record.unit}
          </div>
          <div style={{ marginTop: 2 }}>
            {qty === 0 ? (
              record.soldQuantityGrowthRate === -100 ? (
                <Tooltip title="Kỳ trước có phát sinh đơn hàng, kỳ này chưa phát sinh đơn mới">
                  <Tag color="default" style={{ fontSize: 11 }}>Chưa bán kỳ này (-100%)</Tag>
                </Tooltip>
              ) : (
                <Tag color="default" style={{ fontSize: 11 }}>Chưa bán kỳ này</Tag>
              )
            ) : (
              <Tooltip title="Tỷ lệ tăng trưởng số lượng bán so với kỳ trước">
                {renderGrowthTag(record.soldQuantityGrowthRate)}
              </Tooltip>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Tổng Doanh Thu',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      sorter: (a: ProductReportItem, b: ProductReportItem) => a.totalRevenue - b.totalRevenue,
      render: (rev: number, record: ProductReportItem) => (
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: rev > 0 ? '#2E7D32' : '#999' }}>
            {rev.toLocaleString('vi-VN')} ₫
          </div>
          <div style={{ marginTop: 2 }}>
            {rev === 0 ? (
              <span style={{ fontSize: 11, color: '#aaa' }}>0 ₫ doanh thu</span>
            ) : (
              <Tooltip title="Tỷ lệ tăng trưởng doanh thu so với kỳ trước">
                {renderGrowthTag(record.revenueGrowthRate)}
              </Tooltip>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Kinh Doanh',
      dataIndex: 'status',
      key: 'status',
      width: 115,
      sorter: (a: ProductReportItem, b: ProductReportItem) => (a.status || '').localeCompare(b.status || ''),
      render: (st: string) => (
        <Tag color={st?.toLowerCase() === 'active' ? 'green' : 'orange'}>
          {st?.toLowerCase() === 'active' ? 'Đang bán' : 'Tạm dừng'}
        </Tag>
      ),
    },
    {
      title: 'Chi Tiết',
      key: 'action',
      width: 95,
      render: (_: any, record: ProductReportItem) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewBatches(record)}
        >
          Lô kho
        </Button>
      ),
    },
  ];

  const hasActiveFilters = Boolean(
    search.trim() ||
    categoryId ||
    supplierFilter !== 'all' ||
    stockFilter !== 'ALL' ||
    businessStatus !== 'ALL' ||
    salesFilter !== 'all' ||
    timeRange !== 'thisMonth' ||
    customDates
  );

  return (
    <div style={{ padding: 24 }}>
      {/* ── HEADER & ACTIONS ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1B5E20' }}>
            📊 Thống Kê Báo Cáo Sản Phẩm & Quản Lý Tồn Kho
          </Title>
          <Text type="secondary">
            Kỳ báo cáo: <strong style={{ color: '#2E7D32' }}>{period?.label || 'Đang tải...'}</strong> · Tìm kiếm, lọc và phân tích chi tiết theo mọi tiêu chí
          </Text>
        </div>
        <Space wrap>
          {hasActiveFilters && (
            <Button
              icon={<RollbackOutlined />}
              onClick={handleResetFilters}
              danger
            >
              Đặt lại bộ lọc
            </Button>
          )}
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            loading={exporting}
            onClick={handleExportCSV}
            style={{ backgroundColor: '#2E7D32', borderColor: '#2E7D32' }}
          >
            Xuất Excel / CSV (.csv)
          </Button>
          <Button
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={() => fetchReport()}
          >
            Làm mới
          </Button>
        </Space>
      </div>

      {/* ── BỘ LỌC THỜI GIAN & TÌM KIẾM CHUYÊN SÂU TOÀN DIỆN ── */}
      <Card style={{ marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Row gutter={[16, 16]} align="middle">
          {/* Preset Thời gian */}
          <Col xs={24} lg={14}>
            <Space wrap>
              <Text strong style={{ marginRight: 4 }}>Kỳ báo cáo:</Text>
              <Radio.Group
                value={timeRange}
                onChange={(e) => {
                  setTimeRange(e.target.value);
                  setPage(1);
                }}
                buttonStyle="solid"
                size="middle"
              >
                <Radio.Button value="today">Hôm nay</Radio.Button>
                <Radio.Button value="yesterday">Hôm qua</Radio.Button>
                <Radio.Button value="last7days">7 ngày qua</Radio.Button>
                <Radio.Button value="last30days">30 ngày qua</Radio.Button>
                <Radio.Button value="thisMonth">Tháng này</Radio.Button>
                <Radio.Button value="lastMonth">Tháng trước</Radio.Button>
                <Radio.Button value="thisYear">Năm nay</Radio.Button>
                <Radio.Button value="custom">Tùy chọn</Radio.Button>
              </Radio.Group>
            </Space>
          </Col>

          {/* Chọn khoảng ngày tùy chọn nếu chọn "custom" */}
          {timeRange === 'custom' && (
            <Col xs={24} lg={10}>
              <RangePicker
                format="DD/MM/YYYY"
                placeholder={['Từ ngày', 'Đến ngày']}
                onChange={(dates) => {
                  setCustomDates(dates as any);
                  setPage(1);
                }}
                style={{ width: '100%' }}
              />
            </Col>
          )}
        </Row>

        {/* Hàng 2: Bộ lọc chi tiết theo tất cả các thành phần bảng */}
        <Row gutter={[12, 12]} style={{ marginTop: 16 }}>
          {/* 1. Tìm kiếm đa năng theo ID, Tên, SKU, Danh mục, HTX có gợi ý AutoComplete */}
          <Col xs={24} sm={12} md={8} lg={6}>
            <AutoComplete
              style={{ width: '100%' }}
              options={searchSuggestions}
              value={search}
              onSelect={(val) => {
                setSearch(val);
                setPage(1);
              }}
              onChange={(val) => {
                setSearch(val);
                setPage(1);
              }}
              popupMatchSelectWidth={false}
            >
              <Input
                prefix={<SearchOutlined style={{ color: '#bbb' }} />}
                placeholder="Nhập ID (#10), chữ cái (C, c...), Tên SP..."
                allowClear
              />
            </AutoComplete>
          </Col>

          {/* 2. Lọc theo Danh mục nông sản */}
          <Col xs={24} sm={12} md={8} lg={4}>
            <Select
              placeholder="Danh mục nông sản"
              allowClear
              style={{ width: '100%' }}
              value={categoryId}
              onChange={(val) => {
                setCategoryId(val);
                setPage(1);
              }}
            >
              <Select.Option value={0}>Tất cả danh mục ({categories.length})</Select.Option>
              {categories.map((c) => (
                <Select.Option key={c.categoryId} value={c.categoryId}>
                  {c.categoryName}
                </Select.Option>
              ))}
            </Select>
          </Col>

          {/* 3. Lọc theo Nhà cung cấp / Hợp tác xã */}
          <Col xs={24} sm={12} md={8} lg={5}>
            <Select
              placeholder="Nhà cung cấp / HTX"
              style={{ width: '100%' }}
              value={supplierFilter}
              onChange={(val) => {
                setSupplierFilter(val);
                setPage(1);
              }}
            >
              <Select.Option value="all">Tất cả nhà cung cấp ({suppliers.length})</Select.Option>
              {suppliers.map((s: any) => {
                const sid = s.supplierId || s.userId;
                return (
                  <Select.Option key={sid} value={sid}>
                    🏢 {s.fullName || s.supplierName || `Nhà cung cấp #${sid}`}
                  </Select.Option>
                );
              })}
            </Select>
          </Col>

          {/* 4. Lọc theo Trạng thái tồn kho */}
          <Col xs={24} sm={12} md={8} lg={3}>
            <Select
              placeholder="Trạng thái tồn kho"
              style={{ width: '100%' }}
              value={stockFilter}
              onChange={(val) => {
                setStockFilter(val);
                setPage(1);
              }}
            >
              <Select.Option value="ALL">Tất cả tồn kho</Select.Option>
              <Select.Option value="InStock">🟢 Còn hàng (&gt; 20)</Select.Option>
              <Select.Option value="LowStock">🟡 Sắp hết (1 - 20)</Select.Option>
              <Select.Option value="OutOfStock">🔴 Hết hàng (0)</Select.Option>
            </Select>
          </Col>

          {/* 5. Lọc theo Trạng thái kinh doanh */}
          <Col xs={24} sm={12} md={8} lg={3}>
            <Select
              placeholder="Trạng thái KD"
              style={{ width: '100%' }}
              value={businessStatus}
              onChange={(val) => {
                setBusinessStatus(val);
                setPage(1);
              }}
            >
              <Select.Option value="ALL">Tất cả kinh doanh</Select.Option>
              <Select.Option value="Active">Đang bán</Select.Option>
              <Select.Option value="Inactive">Tạm dừng</Select.Option>
            </Select>
          </Col>

          {/* 6. Lọc theo Doanh số & Hiệu suất bán hàng */}
          <Col xs={24} sm={12} md={8} lg={3}>
            <Select
              placeholder="Hiệu suất bán"
              style={{ width: '100%' }}
              value={salesFilter}
              onChange={(val) => {
                setSalesFilter(val);
                setPage(1);
              }}
            >
              <Select.Option value="all">Tất cả hiệu suất</Select.Option>
              <Select.Option value="hasSales">🟢 Đã bán trong kỳ (&gt; 0)</Select.Option>
              <Select.Option value="noSales">⚪ Chưa bán trong kỳ (0)</Select.Option>
              <Select.Option value="positiveGrowth">📈 Tăng trưởng dương (+%)</Select.Option>
              <Select.Option value="negativeGrowth">📉 Tăng trưởng âm (-%)</Select.Option>
            </Select>
          </Col>
        </Row>

        {/* Hàng 3: Thanh tóm tắt kết quả tìm kiếm thời gian thực & Các bộ lọc đang áp dụng */}
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <Space wrap size={6}>
            <Tag color="blue" style={{ fontSize: 13, padding: '4px 12px', borderRadius: 6, fontWeight: 600 }}>
              Tổng kết quả lọc: <strong style={{ color: '#0958d9', fontSize: 15 }}>{totalItems}</strong> nông sản
              {totalItems > 0 && (
                <span style={{ fontWeight: 400, color: '#475569', marginLeft: 6 }}>
                  (Đang xem trang {page}/{Math.ceil(totalItems / pageSize) || 1} · {items.length} sp/trang)
                </span>
              )}
            </Tag>

            {search.trim() && (
              <Tag closable onClose={() => setSearch('')} color="geekblue">
                Từ khóa: "{search.trim()}"
              </Tag>
            )}

            {categoryId && categoryId > 0 && (
              <Tag closable onClose={() => setCategoryId(undefined)} color="cyan">
                Danh mục: {categories.find(c => c.categoryId === categoryId)?.categoryName}
              </Tag>
            )}

            {supplierFilter !== 'all' && (
              <Tag closable onClose={() => setSupplierFilter('all')} color="purple">
                HTX: {getSupplierName(Number(supplierFilter))}
              </Tag>
            )}

            {stockFilter !== 'ALL' && (
              <Tag closable onClose={() => { setStockFilter('ALL'); setPage(1); }} color="orange">
                Tồn kho: {stockFilter === 'InStock' ? 'Còn hàng (>20)' : (stockFilter === 'LowStock' ? 'Sắp hết (1-20)' : 'Hết hàng (0)')}
              </Tag>
            )}

            {businessStatus !== 'ALL' && (
              <Tag closable onClose={() => { setBusinessStatus('ALL'); setPage(1); }} color="green">
                Kinh doanh: {businessStatus === 'Active' ? 'Đang bán' : 'Tạm dừng'}
              </Tag>
            )}

            {salesFilter !== 'all' && (
              <Tag closable onClose={() => { setSalesFilter('all'); setPage(1); }} color="magenta">
                Hiệu suất: {
                  salesFilter === 'hasSales' ? 'Đã bán trong kỳ (>0)' :
                  salesFilter === 'noSales' ? 'Chưa bán trong kỳ (0)' :
                  salesFilter === 'positiveGrowth' ? 'Tăng trưởng (+%)' : 'Tăng trưởng (-%)'
                }
              </Tag>
            )}
          </Space>

          {hasActiveFilters && (
            <Button
              type="link"
              size="small"
              onClick={handleResetFilters}
              style={{ color: '#ff4d4f', padding: 0 }}
            >
              Xóa tất cả bộ lọc (Reset)
            </Button>
          )}
        </div>
      </Card>

      {/* ── KPI CARDS CÓ KHẢ NĂNG NHẤN VÀO ĐỂ DRILL DOWN RA DỮ LIỆU CỤ THỂ ── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {/* 1. Doanh thu -> Drilldown danh sách đơn hàng đóng góp doanh thu */}
        <Col xs={24} sm={12} lg={6}>
          <Tooltip title="👉 Nhấn để xem danh sách chi tiết các đơn hàng đóng góp doanh thu">
            <Card
              hoverable
              onClick={() => handleOpenDrilldown('revenue')}
              bordered={false}
              style={{
                background: '#F6FFED',
                borderLeft: '5px solid #52C41A',
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: '#389E0D' }}><DollarOutlined /> TỔNG DOANH THU KỲ NÀY</span>
                <Tag color="green" style={{ fontSize: 10 }}>Xem chi tiết ↗</Tag>
              </div>
              <Statistic
                value={summary?.totalRevenue || 0}
                suffix="₫"
                valueStyle={{ color: '#237804', fontWeight: 'bold', fontSize: 24, marginTop: 4 }}
              />
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                <span style={{ color: '#666' }}>So với kỳ trước:</span>
                <span>{renderGrowthTag(summary?.revenueGrowthRate || 0)}</span>
              </div>
              <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                Kỳ trước: {(summary?.prevTotalRevenue || 0).toLocaleString('vi-VN')} ₫
              </div>
            </Card>
          </Tooltip>
        </Col>

        {/* 2. Sản lượng bán -> Drilldown danh sách chi tiết sản phẩm đã bán */}
        <Col xs={24} sm={12} lg={6}>
          <Tooltip title="👉 Nhấn để xem danh sách chi tiết các mặt hàng đã bán trong kỳ">
            <Card
              hoverable
              onClick={() => handleOpenDrilldown('sold')}
              bordered={false}
              style={{
                background: '#E6F7FF',
                borderLeft: '5px solid #1890FF',
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: '#096DD9' }}><ShoppingCartOutlined /> TỔNG SẢN LƯỢNG BÁN</span>
                <Tag color="blue" style={{ fontSize: 10 }}>Xem chi tiết ↗</Tag>
              </div>
              <Statistic
                value={summary?.totalSoldQuantity || 0}
                valueStyle={{ color: '#0050B3', fontWeight: 'bold', fontSize: 24, marginTop: 4 }}
              />
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                <span style={{ color: '#666' }}>So với kỳ trước:</span>
                <span>{renderGrowthTag(summary?.soldQuantityGrowthRate || 0)}</span>
              </div>
              <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                Kỳ trước: {(summary?.prevTotalSoldQuantity || 0).toLocaleString('vi-VN')} SP
              </div>
            </Card>
          </Tooltip>
        </Col>

        {/* 3. Tồn kho toàn hệ thống -> Drilldown toàn bộ lô hàng FEFO & cảnh báo cận hạn */}
        <Col xs={24} sm={12} lg={6}>
          <Tooltip title="👉 Nhấn để xem danh sách toàn bộ các lô hàng tồn kho (FEFO)">
            <Card
              hoverable
              onClick={() => handleOpenDrilldown('inventory')}
              bordered={false}
              style={{
                background: '#FFF7E6',
                borderLeft: '5px solid #FA8C16',
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: '#D46B08' }}><InboxOutlined /> TỔNG TỒN KHO HỆ THỐNG</span>
                <Tag color="orange" style={{ fontSize: 10 }}>Xem lô kho ↗</Tag>
              </div>
              <Statistic
                value={summary?.totalStock || 0}
                valueStyle={{ color: '#AD4E00', fontWeight: 'bold', fontSize: 24, marginTop: 4 }}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                Quy mô: <strong>{summary?.totalProductsCount || 0}</strong> sản phẩm đang quản lý
              </div>
              <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                Tổng hợp từ các lô hàng còn hạn sử dụng (FEFO)
              </div>
            </Card>
          </Tooltip>
        </Col>

        {/* 4. Quản lý Hoàn kho (Rollback & Returns) -> Drilldown chi tiết nhật ký đơn hủy / trả hàng */}
        <Col xs={24} sm={12} lg={6}>
          <Tooltip title="👉 Nhấn để xem nhật ký các đơn hàng bị Hủy / Trả hàng và lịch sử hoàn kho ACID">
            <Card
              hoverable
              onClick={() => handleOpenDrilldown('returns')}
              bordered={false}
              style={{
                background: '#FFF1F0',
                borderLeft: '5px solid #FF4D4F',
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: '#CF1322' }}><RollbackOutlined /> HOÀN KHO &amp; TRẢ HÀNG (ACID)</span>
                <Tag color="red" style={{ fontSize: 10 }}>Xem nhật ký ↗</Tag>
              </div>
              <Statistic
                value={summary?.returnedOrdersCount || 0}
                suffix="đơn"
                valueStyle={{ color: '#A8071A', fontWeight: 'bold', fontSize: 24, marginTop: 4 }}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                Giá trị hoàn lại: <strong style={{ color: '#CF1322' }}>{(summary?.returnedRevenue || 0).toLocaleString('vi-VN')} ₫</strong>
              </div>
              <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                Đã tự động cộng lại kho: <strong>{(summary?.returnedQuantity || 0).toLocaleString('vi-VN')}</strong> đơn vị
              </div>
            </Card>
          </Tooltip>
        </Col>
      </Row>

      {/* ── TRUNG TÂM PHÂN TÍCH & TRỰC QUAN HÓA BÁO CÁO NÂNG CAO (ECHARTS & LUCIDE) ── */}
      <Card
        style={{
          marginBottom: 20,
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          border: '1px solid #E2E8F0',
        }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, padding: '4px 0' }}>
            <Space align="center" size={10}>
              <div style={{
                background: 'linear-gradient(135deg, #10B981, #059669)',
                color: '#fff',
                width: 36,
                height: 36,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
              }}>
                <TrendingUp size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>Trung Tâm Trực Quan Hóa Báo Cáo &amp; Xu Hướng Kinh Doanh</span>
                  <Tag color="cyan" style={{ fontSize: 11, borderRadius: 12, padding: '0 8px' }}>
                    <Sparkles size={11} style={{ display: 'inline', marginRight: 3 }} /> ECharts Interactive
                  </Tag>
                </div>
                <div style={{ fontSize: 12, color: '#64748B', fontWeight: 400 }}>
                  Dữ liệu phân tích đa chiều theo thời gian thực (Kỳ: {period?.label || 'Đang cập nhật...'})
                </div>
              </div>
            </Space>

            <Segmented
              value={chartActiveTab}
              onChange={(val) => setChartActiveTab(val as string)}
              options={[
                {
                  value: 'trend',
                  label: (
                    <Space size={6} style={{ padding: '2px 4px' }}>
                      <LineChartOutlined style={{ color: chartActiveTab === 'trend' ? '#10B981' : undefined }} />
                      <span style={{ fontWeight: chartActiveTab === 'trend' ? 600 : 400 }}>Xu Hướng Đa Chiều</span>
                    </Space>
                  ),
                },
                {
                  value: 'category',
                  label: (
                    <Space size={6} style={{ padding: '2px 4px' }}>
                      <PieChartOutlined style={{ color: chartActiveTab === 'category' ? '#F59E0B' : undefined }} />
                      <span style={{ fontWeight: chartActiveTab === 'category' ? 600 : 400 }}>Cơ Cấu Danh Mục</span>
                    </Space>
                  ),
                },
                {
                  value: 'ranking',
                  label: (
                    <Space size={6} style={{ padding: '2px 4px' }}>
                      <TrophyOutlined style={{ color: chartActiveTab === 'ranking' ? '#FAAD14' : undefined }} />
                      <span style={{ fontWeight: chartActiveTab === 'ranking' ? 600 : 400 }}>Top 5 Xếp Hạng</span>
                    </Space>
                  ),
                },
                {
                  value: 'inventory',
                  label: (
                    <Space size={6} style={{ padding: '2px 4px' }}>
                      <SafetyCertificateOutlined style={{ color: chartActiveTab === 'inventory' ? '#3B82F6' : undefined }} />
                      <span style={{ fontWeight: chartActiveTab === 'inventory' ? 600 : 400 }}>Sức Khỏe Tồn Kho</span>
                    </Space>
                  ),
                },
              ]}
            />
          </div>
        }
      >
        <Row gutter={[20, 20]}>
          {/* CỘT TRÁI: KHUNG BIỂU ĐỒ TƯƠNG TÁC CHÍNH (ECHARTS) */}
          <Col xs={24} xl={16}>
            <div style={{ background: '#FAFBFD', borderRadius: 10, padding: 16, border: '1px solid #EEF2F6', minHeight: 420 }}>
              {/* TAB 1: XU HƯỚNG BÁN HÀNG & DOANH THU */}
              {chartActiveTab === 'trend' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Text strong style={{ fontSize: 14, color: '#1E293B' }}>
                        Biểu Đồ Xu Hướng Đa Trục (Doanh Thu Spline &amp; Sản Lượng Bán)
                      </Text>
                      <Tooltip title="Đường cong Spline màu xanh ngọc thể hiện doanh thu (₫); cột bo góc màu xanh dương thể hiện sản lượng bán (SP). Bạn có thể dùng thanh trượt zoom bên dưới hoặc kéo chuột để phóng to khoảng ngày cần soi chi tiết.">
                        <Tag color="default" style={{ cursor: 'pointer', fontSize: 11 }}>ℹ️ Hướng dẫn</Tag>
                      </Tooltip>
                    </div>

                    <Radio.Group
                      size="small"
                      value={trendMode}
                      onChange={(e) => setTrendMode(e.target.value)}
                      buttonStyle="solid"
                    >
                      <Radio.Button value="all">Tất cả (Hỗn hợp)</Radio.Button>
                      <Radio.Button value="revenue">Chỉ Doanh thu (₫)</Radio.Button>
                      <Radio.Button value="quantity">Chỉ Sản lượng (SP)</Radio.Button>
                    </Radio.Group>
                  </div>

                  {trendData.length > 0 ? (
                    <ReactECharts
                      option={getTrendOption(trendMode)}
                      style={{ height: 350, width: '100%' }}
                      notMerge={true}
                    />
                  ) : (
                    <div style={{ height: 350, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                      <InboxOutlined style={{ fontSize: 40, marginBottom: 8, opacity: 0.5 }} />
                      <div>Chưa có dữ liệu xu hướng trong khoảng thời gian được chọn</div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: CƠ CẤU DOANH THU THEO DANH MỤC */}
              {chartActiveTab === 'category' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                    <Text strong style={{ fontSize: 14, color: '#1E293B' }}>
                      Biểu Đồ Donut Tỷ Trọng Đóng Góp Theo Nhóm Hàng
                    </Text>

                    <Radio.Group
                      size="small"
                      value={categoryChartType}
                      onChange={(e) => setCategoryChartType(e.target.value)}
                      buttonStyle="solid"
                    >
                      <Radio.Button value="revenue">Tỷ trọng Doanh thu (₫)</Radio.Button>
                      <Radio.Button value="quantity">Tỷ trọng Sản lượng (SP)</Radio.Button>
                    </Radio.Group>
                  </div>

                  {categoryDistribution && categoryDistribution.length > 0 ? (
                    <ReactECharts
                      option={getCategoryDonutOption(categoryChartType)}
                      style={{ height: 350, width: '100%' }}
                      notMerge={true}
                    />
                  ) : (
                    <div style={{ height: 350, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                      <InboxOutlined style={{ fontSize: 40, marginBottom: 8, opacity: 0.5 }} />
                      <div>Chưa có dữ liệu phân loại danh mục trong kỳ</div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: BẢNG XẾP HẠNG TOP 5 */}
              {chartActiveTab === 'ranking' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                    <Text strong style={{ fontSize: 14, color: '#1E293B' }}>
                      Bảng Xếp Hạng Top 5 Sản Phẩm Dẫn Đầu Thị Trường
                    </Text>

                    <Radio.Group
                      size="small"
                      value={topRankingType}
                      onChange={(e) => setTopRankingType(e.target.value)}
                      buttonStyle="solid"
                    >
                      <Radio.Button value="revenue">Top Doanh thu 💎</Radio.Button>
                      <Radio.Button value="quantity">Top Bán chạy 🔥</Radio.Button>
                    </Radio.Group>
                  </div>

                  {(topRankingType === 'revenue' ? topRevenue : topSelling).length > 0 ? (
                    <ReactECharts
                      option={getTopRankingOption(topRankingType)}
                      style={{ height: 350, width: '100%' }}
                      notMerge={true}
                    />
                  ) : (
                    <div style={{ height: 350, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                      <InboxOutlined style={{ fontSize: 40, marginBottom: 8, opacity: 0.5 }} />
                      <div>Chưa có dữ liệu xếp hạng trong kỳ</div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: SỨC KHỎE TỒN KHO */}
              {chartActiveTab === 'inventory' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Text strong style={{ fontSize: 14, color: '#1E293B' }}>
                      Tỷ Lệ Phân Bổ Trạng Thái Tồn Kho &amp; Rủi Ro Cận Hạn (FEFO)
                    </Text>
                    <Tag color="orange">Định hướng xuất hàng FEFO</Tag>
                  </div>

                  <ReactECharts
                    option={getInventoryHealthOption()}
                    style={{ height: 350, width: '100%' }}
                    notMerge={true}
                  />
                </div>
              )}
            </div>
          </Col>

          {/* CỘT PHẢI: SMART INSIGHTS & ĐIỂM NHẤN TỔNG THỂ */}
          <Col xs={24} xl={8}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
              {/* Highlight 1: Ngày Đạt Đỉnh Doanh Thu */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
                  border: '1px solid #BBF7D0',
                  borderRadius: 10,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)'
                }}
              >
                <div style={{
                  background: '#10B981',
                  color: '#fff',
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Flame size={20} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: '#166534', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Đỉnh Doanh Thu Ngày
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#14532D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {peakStats.peakRevDay ? `${Number(peakStats.peakRevDay.revenue).toLocaleString('vi-VN')} ₫` : '0 ₫'}
                  </div>
                  <div style={{ fontSize: 11, color: '#15803D' }}>
                    {peakStats.peakRevDay ? `Ngày ${peakStats.peakRevDay.date} (${peakStats.peakRevDay.quantity} SP bán ra)` : 'Chưa có giao dịch'}
                  </div>
                </div>
              </div>

              {/* Highlight 2: Nhóm Ngành / Danh Mục Chiếm Ưu Thế */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                  border: '1px solid #FCD34D',
                  borderRadius: 10,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.08)'
                }}
              >
                <div style={{
                  background: '#F59E0B',
                  color: '#fff',
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Layers size={20} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: '#92400E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Nhóm Nông Sản Chủ Lực
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#78350F', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {peakStats.topCategory ? peakStats.topCategory.name : 'Chưa có'}
                  </div>
                  <div style={{ fontSize: 11, color: '#B45309' }}>
                    {peakStats.topCategory ? `Thu về ${Number(peakStats.topCategory.revenue).toLocaleString('vi-VN')} ₫ (${peakStats.topCategory.soldQuantity} SP)` : 'Chưa có số liệu'}
                  </div>
                </div>
              </div>

              {/* Highlight 3: Bảng Danh Dự Top 3 Sản Phẩm Ngôi Sao */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #E2E8F0',
                  borderRadius: 10,
                  padding: '14px 16px',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1E293B', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Award size={16} color="#F59E0B" />
                      Top 3 Nông Sản Dẫn Đầu Doanh Thu
                    </span>
                    <Tag color="gold" style={{ fontSize: 10, margin: 0 }}>Best Sellers</Tag>
                  </div>

                  {topRevenue.length > 0 ? (
                    topRevenue.slice(0, 3).map((item: any, idx: number) => {
                      const maxRev = topRevenue[0]?.totalRevenue || 1;
                      const percent = Math.min(100, Math.round((item.totalRevenue / maxRev) * 100));
                      const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
                      const strokeColor = idx === 0 ? '#F59E0B' : idx === 1 ? '#64748B' : '#D97706';

                      return (
                        <div key={item.productId} style={{ margin: '10px 0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                            <span style={{ fontWeight: 600, color: '#334155' }}>
                              <span style={{ marginRight: 4 }}>{medal}</span>
                              {item.productName}
                            </span>
                            <span style={{ fontWeight: 700, color: '#10B981' }}>
                              {Number(item.totalRevenue).toLocaleString('vi-VN')} ₫
                            </span>
                          </div>
                          <Progress
                            percent={percent}
                            strokeColor={strokeColor}
                            size="small"
                            showInfo={false}
                            style={{ margin: '4px 0 0 0' }}
                          />
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94A3B8' }}>
                            <span>SKU: {item.sku}</span>
                            <span>Đã bán: {item.soldQuantity} {item.unit}</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', padding: '20px 0' }}>
                      Chưa có dữ liệu bán trong kỳ
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 8, marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#64748B' }}>
                  <span>TB Doanh thu / ngày:</span>
                  <strong style={{ color: '#0F172A' }}>{Math.round(peakStats.avgRevPerDay).toLocaleString('vi-VN')} ₫/ngày</strong>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* ── BẢNG THỐNG KÊ CHI TIẾT SẢN PHẨM & TỒN KHO ── */}
      <Card
        title={
          <Space size={10} align="center">
            <span>Danh Sách Thống Kê Chi Tiết Sản Phẩm &amp; Quản Lý Tồn Kho</span>
            <Tag color={totalItems > 0 ? 'green' : 'default'} style={{ fontSize: 13, fontWeight: 700, padding: '2px 10px', borderRadius: 12 }}>
              {totalItems} nông sản
            </Tag>
          </Space>
        }
        extra={
          <Space wrap>
            <Text type="secondary">Hiển thị:</Text>
            <Select
              value={pageSize}
              style={{ width: 145 }}
              onChange={(val) => {
                setPageSize(val);
                setPage(1);
              }}
            >
              <Select.Option value={10}>10 dòng / trang</Select.Option>
              <Select.Option value={20}>20 dòng / trang</Select.Option>
              <Select.Option value={50}>50 dòng / trang</Select.Option>
              <Select.Option value={100}>100 dòng / trang</Select.Option>
              <Select.Option value={500}>Xem tất cả (Toàn bộ)</Select.Option>
            </Select>

            <Text type="secondary" style={{ marginLeft: 6 }}>Sắp xếp theo:</Text>
            <Select
              value={sortBy}
              style={{ width: 140 }}
              onChange={(val) => {
                setSortBy(val);
                setPage(1);
              }}
            >
              <Select.Option value="revenue">Doanh thu</Select.Option>
              <Select.Option value="soldQuantity">Sản lượng bán</Select.Option>
              <Select.Option value="currentStock">Tồn kho</Select.Option>
              <Select.Option value="productName">Tên sản phẩm</Select.Option>
            </Select>
            <Select
              value={sortOrder}
              style={{ width: 100 }}
              onChange={(val) => {
                setSortOrder(val);
                setPage(1);
              }}
            >
              <Select.Option value="desc">Giảm dần</Select.Option>
              <Select.Option value="asc">Tăng dần</Select.Option>
            </Select>
          </Space>
        }
      >
        <Table
          columns={columns as any}
          dataSource={items}
          rowKey="productId"
          loading={loading}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: totalItems,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100', '500'],
            position: ['topRight', 'bottomRight'],
            showTotal: (total, range) => (
              <span style={{ fontSize: 13, color: '#475569', marginRight: 12 }}>
                Đang hiển thị <strong>{range[0]}-{range[1]}</strong> trên tổng số <strong style={{ color: '#10B981', fontSize: 14 }}>{total}</strong> sản phẩm ({Math.ceil(total / pageSize) || 1} trang)
              </span>
            ),
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
          onChange={(_pagination, _filters, sorter: any) => {
            if (sorter && sorter.field) {
              setSortBy(sorter.field);
              setSortOrder(sorter.order === 'ascend' ? 'asc' : 'desc');
            }
          }}
        />
      </Card>

      {/* ── MODAL XEM CHI TIẾT LÔ HÀNG CỦA 1 SẢN PHẨM ── */}
      <Modal
        title={`Chi Tiết Lô Hàng Tồn Kho - ${selectedProduct?.productName}`}
        open={batchModalOpen}
        onCancel={() => setBatchModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setBatchModalOpen(false)}>Đóng</Button>
        ]}
        width={800}
      >
        {selectedProduct && (
          <div style={{ marginTop: 10 }}>
            <div style={{ marginBottom: 15, padding: 12, backgroundColor: '#f9f9f9', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <strong>Mã ID: </strong><Tag color="purple">#{selectedProduct.productId}</Tag>
                <strong>Mã SKU: </strong><Tag color="geekblue">{selectedProduct.sku}</Tag>
                <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>
                  Tổng tồn khả dụng: <strong style={{ color: '#2E7D32' }}>{selectedProduct.currentStock.toLocaleString('vi-VN')} {selectedProduct.unit}</strong> · {selectedProduct.batchesCount} lô
                </div>
              </div>
              <Tag color={selectedProduct.stockStatus === 'InStock' ? 'green' : (selectedProduct.stockStatus === 'LowStock' ? 'orange' : 'red')} style={{ fontSize: 12, padding: '4px 10px' }}>
                {selectedProduct.stockStatus === 'InStock' ? '🟢 Còn hàng' : (selectedProduct.stockStatus === 'LowStock' ? '🟡 Sắp hết hàng' : '🔴 Hết hàng')}
              </Tag>
            </div>

            <Input
              prefix={<SearchOutlined style={{ color: '#bbb' }} />}
              placeholder="Tìm theo Mã lô, Ngày thu hoạch, Hạn dùng, Trạng thái..."
              value={batchSearch}
              allowClear
              onChange={(e) => setBatchSearch(e.target.value)}
              style={{ marginBottom: 12 }}
            />

            <Table
              dataSource={productBatches.filter((b: any) => {
                if (!batchSearch.trim()) return true;
                const q = batchSearch.trim().toLowerCase();
                const bCode = (b.batchCode || '').toLowerCase();
                const harv = b.harvestDate ? dayjs(b.harvestDate).format('DD/MM/YYYY') : '';
                const exp = b.expiryDate ? dayjs(b.expiryDate).format('DD/MM/YYYY') : '';
                const st = (b.status || '').toLowerCase();
                return bCode.includes(q) || harv.includes(q) || exp.includes(q) || st.includes(q);
              })}
              rowKey="batchId"
              loading={batchLoading}
              size="small"
              columns={[
                {
                  title: 'Mã Lô',
                  dataIndex: 'batchCode',
                  key: 'batchCode',
                  sorter: (a: any, b: any) => (a.batchCode || '').localeCompare(b.batchCode || ''),
                  render: (code: string) => <Tag color="blue" style={{ fontWeight: 600, fontFamily: 'monospace' }}>{code}</Tag>
                },
                {
                  title: 'Ngày thu hoạch',
                  dataIndex: 'harvestDate',
                  key: 'harvestDate',
                  sorter: (a: any, b: any) => dayjs(a.harvestDate || 0).unix() - dayjs(b.harvestDate || 0).unix(),
                  render: (d: any) => d ? dayjs(d).format('DD/MM/YYYY') : '-'
                },
                {
                  title: 'Hạn dùng (FEFO)',
                  dataIndex: 'expiryDate',
                  key: 'expiryDate',
                  sorter: (a: any, b: any) => dayjs(a.expiryDate || 0).unix() - dayjs(b.expiryDate || 0).unix(),
                  render: (d: any) => {
                    const isExpired = dayjs(d).isBefore(dayjs());
                    return (
                      <span style={{ color: isExpired ? '#ff4d4f' : '#2E7D32', fontWeight: isExpired ? 600 : 'normal' }}>
                        {dayjs(d).format('DD/MM/YYYY')} {isExpired ? '(Hết hạn)' : ''}
                      </span>
                    );
                  }
                },
                {
                  title: 'Tồn thực tế',
                  dataIndex: 'initialQuantity',
                  key: 'initialQuantity',
                  sorter: (a: any, b: any) => (a.initialQuantity || 0) - (b.initialQuantity || 0),
                  render: (q: number, rec: any) => <strong>{q} {rec.unit || selectedProduct.unit}</strong>
                },
                {
                  title: 'Trạng thái',
                  dataIndex: 'status',
                  key: 'status',
                  sorter: (a: any, b: any) => (a.status || '').localeCompare(b.status || ''),
                  render: (st: string) => <Tag color={st === 'Active' ? 'green' : 'default'}>{st || 'Active'}</Tag>
                },
              ]}
              pagination={false}
            />
          </div>
        )}
      </Modal>

      {/* ── DRAWER DRILLDOWN: CHI TIẾT DỮ LIỆU CỤ THỂ KHI CLICK VÀO TỪNG THẺ KPI ── */}
      <Drawer
        title={
          drilldownType === 'revenue' ? `💰 Chi Tiết Doanh Thu Báo Cáo - ${drilldownData?.periodLabel || period?.label}` :
          drilldownType === 'sold' ? `📦 Chi Tiết Sản Lượng Sản Phẩm Đã Bán - ${drilldownData?.periodLabel || period?.label}` :
          drilldownType === 'inventory' ? `🏢 Báo Cáo Tồn Kho Khả Dụng & Lô Hàng Thu Hoạch (FEFO)` :
          `🛡️ Nhật Ký Đơn Hàng Hoàn Kho & Trả Hàng (Rollback ACID) - ${drilldownData?.periodLabel || period?.label}`
        }
        placement="right"
        width={920}
        onClose={() => {
          setDrilldownType(null);
          setDrillSearch('');
        }}
        open={drilldownType !== null}
        loading={drilldownLoading}
        extra={
          <Button size="small" icon={<ExportOutlined />} onClick={handleExportCSV}>
            Xuất file
          </Button>
        }
      >
        {/* Thanh tìm kiếm nhanh bên trong Drawer */}
        <Input
          prefix={<SearchOutlined style={{ color: '#bbb' }} />}
          placeholder="Tìm nhanh theo Mã đơn, Sản phẩm, Khách hàng, SĐT, Mã lô..."
          value={drillSearch}
          allowClear
          onChange={(e) => setDrillSearch(e.target.value)}
          style={{ marginBottom: 16 }}
        />

        {/* 1. DRILLDOWN DOANH THU */}
        {drilldownType === 'revenue' && (
          <div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
              <Card size="small" style={{ flex: 1, background: '#F6FFED', borderLeft: '4px solid #52C41A' }}>
                <Statistic title="Tổng Doanh Thu Hợp Lệ" value={drilldownData?.totalRevenue || 0} suffix="₫" valueStyle={{ color: '#2E7D32', fontWeight: 700 }} />
              </Card>
              <Card size="small" style={{ flex: 1, background: '#E6F7FF', borderLeft: '4px solid #1890FF' }}>
                <Statistic title="Số Đơn Hàng Thành Công" value={drilldownData?.totalOrders || 0} suffix="đơn" valueStyle={{ color: '#096DD9', fontWeight: 700 }} />
              </Card>
              <Card size="small" style={{ flex: 1, background: '#FFF7E6', borderLeft: '4px solid #FA8C16' }}>
                <Statistic title="Giá Trị Đơn Trung Bình (AOV)" value={drilldownData?.averageOrderValue || 0} suffix="₫/đơn" valueStyle={{ color: '#D46B08', fontWeight: 700 }} />
              </Card>
            </div>

            <Alert
              message="Đã tự động loại trừ các đơn hàng bị Hủy hoặc Trả hàng"
              description="Doanh thu được ghi nhận chính xác theo thời gian thực từ các đơn hàng thành công (Completed / Shipping / Confirmed)."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Table
              dataSource={(drilldownData?.orders || []).filter((o: any) => {
                if (!drillSearch.trim()) return true;
                const q = drillSearch.trim().toLowerCase();
                const code = String(o.orderCode || '').toLowerCase();
                const name = (o.customerName || '').toLowerCase();
                const phone = (o.customerPhone || '').toLowerCase();
                const itemsMatch = (o.items || []).some((i: any) => (i.productName || '').toLowerCase().includes(q));
                return code.includes(q) || name.includes(q) || phone.includes(q) || itemsMatch;
              })}
              rowKey="orderId"
              size="small"
              columns={[
                { title: 'Mã Đơn', dataIndex: 'orderCode', key: 'orderCode', render: (c: any) => <code style={{ fontWeight: 600 }}>#{c}</code> },
                { title: 'Khách hàng', dataIndex: 'customerName', key: 'customerName', render: (n: any, r: any) => <div><div>{n}</div><div style={{ fontSize: 11, color: '#888' }}>{r.customerPhone}</div></div> },
                { title: 'Ngày đặt', dataIndex: 'createdAt', key: 'createdAt', render: (d: any) => d ? dayjs(d).format('DD/MM/YYYY HH:mm') : '-' },
                { title: 'Thanh toán', key: 'pay', render: (_: any, r: any) => <Space direction="vertical" size={2}><Tag color="blue">{r.paymentMethod}</Tag><Tag color={r.paymentStatus === 'Paid' ? 'green' : 'orange'}>{r.paymentStatus || 'Chưa thanh toán'}</Tag></Space> },
                {
                  title: 'Chi tiết sản phẩm mua',
                  key: 'items',
                  render: (_: any, r: any) => (
                    <ul style={{ paddingLeft: 16, margin: 0, fontSize: 12 }}>
                      {r.items?.map((i: any, idx: number) => (
                        <li key={idx}>
                          <strong>{i.productName}</strong> x {i.quantity} {i.unit} ({(i.totalAmount).toLocaleString('vi-VN')}₫)
                        </li>
                      ))}
                    </ul>
                  )
                },
                { title: 'Tổng tiền', dataIndex: 'totalAmount', key: 'totalAmount', render: (v: any) => <strong style={{ color: '#2E7D32' }}>{Number(v).toLocaleString('vi-VN')} ₫</strong> },
              ] as any}
              pagination={{ pageSize: 8 }}
            />
          </div>
        )}

        {/* 2. DRILLDOWN SẢN LƯỢNG BÁN */}
        {drilldownType === 'sold' && (
          <div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
              <Card size="small" style={{ flex: 1, background: '#E6F7FF', borderLeft: '4px solid #1890FF' }}>
                <Statistic title="Tổng Sản Lượng Đã Bán" value={drilldownData?.totalSoldQuantity || 0} suffix="đơn vị" valueStyle={{ color: '#096DD9', fontWeight: 700 }} />
              </Card>
              <Card size="small" style={{ flex: 1, background: '#F6FFED', borderLeft: '4px solid #52C41A' }}>
                <Statistic title="Tổng Doanh Thu Phát Sinh" value={drilldownData?.totalRevenue || 0} suffix="₫" valueStyle={{ color: '#2E7D32', fontWeight: 700 }} />
              </Card>
              <Card size="small" style={{ flex: 1, background: '#FFF7E6', borderLeft: '4px solid #FA8C16' }}>
                <Statistic title="Số Loại Mặt Hàng Đã Bán" value={drilldownData?.productsCount || 0} suffix="mặt hàng" valueStyle={{ color: '#D46B08', fontWeight: 700 }} />
              </Card>
            </div>

            <Table
              dataSource={(drilldownData?.products || []).filter((p: any) => {
                if (!drillSearch.trim()) return true;
                const q = drillSearch.trim().toLowerCase();
                const sku = (p.sku || '').toLowerCase();
                const name = (p.productName || '').toLowerCase();
                const cat = (p.categoryName || '').toLowerCase();
                const pid = String(p.productId || '');
                return sku.includes(q) || name.includes(q) || cat.includes(q) || pid.includes(q);
              })}
              rowKey="productId"
              size="small"
              columns={[
                { title: 'Mã SKU', dataIndex: 'sku', key: 'sku', render: (s: any) => <Tag color="geekblue">{s}</Tag> },
                { title: 'Tên Sản Phẩm', dataIndex: 'productName', key: 'productName', render: (n: any, r: any) => <div><strong>{n}</strong> <div style={{ fontSize: 11, color: '#888' }}>{r.categoryName}</div></div> },
                { title: 'Đơn giá', dataIndex: 'price', key: 'price', render: (p: any, r: any) => `${Number(p).toLocaleString('vi-VN')} ₫/${r.unit}` },
                { title: 'Số lượng đã bán', dataIndex: 'soldQuantity', key: 'soldQuantity', render: (q: any, r: any) => <strong style={{ color: '#1890FF', fontSize: 14 }}>{q} {r.unit}</strong> },
                { title: 'Doanh thu thu về', dataIndex: 'totalRevenue', key: 'totalRevenue', render: (v: any) => <strong style={{ color: '#2E7D32' }}>{Number(v).toLocaleString('vi-VN')} ₫</strong> },
                { title: 'Tồn khả dụng', dataIndex: 'currentStock', key: 'currentStock', render: (s: any, r: any) => <Tag color={s > 0 ? 'green' : 'red'}>{s} {r.unit}</Tag> },
                {
                  title: 'Thao tác',
                  key: 'action',
                  render: (_: any, r: any) => (
                    <Button
                      size="small"
                      type="link"
                      onClick={() => {
                        setSearch(r.productName);
                        setDrilldownType(null);
                        setDrillSearch('');
                      }}
                    >
                      Lọc bảng chính
                    </Button>
                  )
                }
              ] as any}
              pagination={{ pageSize: 8 }}
            />
          </div>
        )}

        {/* 3. DRILLDOWN TỒN KHO HỆ THỐNG */}
        {drilldownType === 'inventory' && (
          <div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
              <Card size="small" style={{ flex: 1, background: '#FFF7E6', borderLeft: '4px solid #FA8C16' }}>
                <Statistic title="Tổng Tồn Kho Khả Dụng" value={drilldownData?.totalStock || 0} suffix="đơn vị" valueStyle={{ color: '#D46B08', fontWeight: 700 }} />
              </Card>
              <Card size="small" style={{ flex: 1, background: '#F0F5FF', borderLeft: '4px solid #2F54EB' }}>
                <Statistic title="Tổng Số Lô Hàng (Batches)" value={drilldownData?.totalBatches || 0} suffix="lô" valueStyle={{ color: '#1D39C4', fontWeight: 700 }} />
              </Card>
              <Card size="small" style={{ flex: 1, background: '#FFF1F0', borderLeft: '4px solid #FF4D4F' }}>
                <Statistic title="Lô Hàng Sắp Hết Hạn (<30 ngày)" value={drilldownData?.nearExpiryCount || 0} suffix="lô" valueStyle={{ color: '#CF1322', fontWeight: 700 }} />
              </Card>
            </div>

            <Tabs
              activeKey={inventoryTabFilter}
              onChange={(key) => setInventoryTabFilter(key)}
              items={[
                { key: 'all', label: `Tất cả lô hàng (${drilldownData?.batches?.length || 0})` },
                { key: 'nearExpiry', label: `⚠️ Sắp hết hạn (${drilldownData?.nearExpiryCount || 0})` },
                { key: 'outOfStock', label: `🔴 Hết hàng (${drilldownData?.outOfStockBatches || 0})` },
              ]}
            />

            <Table
              dataSource={(drilldownData?.batches || []).filter((b: any) => {
                if (inventoryTabFilter === 'nearExpiry' && !b.isNearExpiry) return false;
                if (inventoryTabFilter === 'outOfStock' && b.stock > 0) return false;
                if (!drillSearch.trim()) return true;
                const q = drillSearch.trim().toLowerCase();
                const code = (b.batchCode || '').toLowerCase();
                const pName = (b.productName || '').toLowerCase();
                const fName = (b.farmName || '').toLowerCase();
                const sku = (b.sku || '').toLowerCase();
                return code.includes(q) || pName.includes(q) || fName.includes(q) || sku.includes(q);
              })}
              rowKey="batchId"
              size="small"
              columns={[
                { title: 'Mã Lô', dataIndex: 'batchCode', key: 'batchCode', render: (c: any) => <code style={{ fontWeight: 600 }}>{c}</code> },
                { title: 'Sản phẩm', dataIndex: 'productName', key: 'productName', render: (n: any, r: any) => <div><strong>{n}</strong> <div style={{ fontSize: 11, color: '#888' }}>SKU: {r.sku} · {r.categoryName}</div></div> },
                { title: 'Vùng trồng / Farm', dataIndex: 'farmName', key: 'farmName' },
                { title: 'Ngày thu hoạch', dataIndex: 'harvestDate', key: 'harvestDate', render: (d: any) => d ? dayjs(d).format('DD/MM/YYYY') : '-' },
                {
                  title: 'Hạn dùng (FEFO)',
                  key: 'expiry',
                  render: (_: any, r: any) => {
                    const days = r.daysRemaining;
                    const isExp = days < 0;
                    const isNear = days >= 0 && days <= 30;
                    return (
                      <div>
                        <div>{dayjs(r.expiryDate).format('DD/MM/YYYY')}</div>
                        <Tag color={isExp ? 'red' : (isNear ? 'orange' : 'green')} style={{ fontSize: 11 }}>
                          {isExp ? `Đã hết hạn (${Math.abs(days)} ngày)` : `Còn ${days} ngày`}
                        </Tag>
                      </div>
                    );
                  }
                },
                { title: 'Tồn kho', dataIndex: 'stock', key: 'stock', render: (s: any, r: any) => <strong style={{ color: s > 0 ? '#1B5E20' : '#ff4d4f', fontSize: 13 }}>{s} {r.unit}</strong> },
                {
                  title: 'Trạng thái',
                  dataIndex: 'status',
                  key: 'status',
                  render: (st: any) => (
                    <Tag color={st === 'Active' ? 'green' : (st === 'OutOfStock' ? 'red' : 'default')}>
                      {st === 'Active' ? 'Khả dụng' : (st === 'OutOfStock' ? 'Hết hàng' : 'Hết hạn')}
                    </Tag>
                  )
                },
              ] as any}
              pagination={{ pageSize: 8 }}
            />
          </div>
        )}

        {/* 4. DRILLDOWN HOÀN KHO & TRẢ HÀNG */}
        {drilldownType === 'returns' && (
          <div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
              <Card size="small" style={{ flex: 1, background: '#FFF1F0', borderLeft: '4px solid #FF4D4F' }}>
                <Statistic title="Tổng Đơn Hoàn / Hủy Kho" value={drilldownData?.totalOrders || 0} suffix="đơn" valueStyle={{ color: '#CF1322', fontWeight: 700 }} />
              </Card>
              <Card size="small" style={{ flex: 1, background: '#FFF7E6', borderLeft: '4px solid #FA8C16' }}>
                <Statistic title="Tổng Tiền Đã Hoàn Lại" value={drilldownData?.totalRefunded || 0} suffix="₫" valueStyle={{ color: '#D46B08', fontWeight: 700 }} />
              </Card>
              <Card size="small" style={{ flex: 1, background: '#F6FFED', borderLeft: '4px solid #52C41A' }}>
                <Statistic title="Tổng Số Lượng Hoàn Trả Kho" value={drilldownData?.totalItemsRolledBack || 0} suffix="đơn vị" valueStyle={{ color: '#2E7D32', fontWeight: 700 }} />
              </Card>
            </div>

            <Alert
              message="Đảm bảo tính nhất quán dữ liệu ACID (Database Transaction)"
              description="Khi đơn hàng chuyển sang 'Cancelled' hoặc 'Returned', hệ thống tự động cộng ngược số lượng vào đúng Lô kho (Batches) gốc và loại trừ khỏi doanh thu thực tế."
              type="success"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Table
              dataSource={(drilldownData?.orders || []).filter((o: any) => {
                if (!drillSearch.trim()) return true;
                const q = drillSearch.trim().toLowerCase();
                const code = String(o.orderCode || '').toLowerCase();
                const name = (o.customerName || '').toLowerCase();
                const phone = (o.customerPhone || '').toLowerCase();
                const itemsMatch = (o.items || []).some((i: any) =>
                  (i.productName || '').toLowerCase().includes(q) ||
                  (i.batchCode || '').toLowerCase().includes(q)
                );
                return code.includes(q) || name.includes(q) || phone.includes(q) || itemsMatch;
              })}
              rowKey="orderId"
              size="small"
              columns={[
                { title: 'Mã Đơn', dataIndex: 'orderCode', key: 'orderCode', render: (c: any) => <code style={{ fontWeight: 600 }}>#{c}</code> },
                {
                  title: 'Loại thao tác',
                  dataIndex: 'orderStatus',
                  key: 'orderStatus',
                  render: (st: any) => (
                    <Tag color={st === 'Returned' ? 'volcano' : 'red'}>
                      {st === 'Returned' ? '↩️ Khách trả hàng' : '❌ Hủy đơn hàng'}
                    </Tag>
                  )
                },
                { title: 'Khách hàng', dataIndex: 'customerName', key: 'customerName', render: (n: any, r: any) => <div><div>{n}</div><div style={{ fontSize: 11, color: '#888' }}>{r.customerPhone}</div></div> },
                { title: 'Thời gian hoàn kho', dataIndex: 'processedAt', key: 'processedAt', render: (d: any) => d ? dayjs(d).format('DD/MM/YYYY HH:mm') : '-' },
                {
                  title: 'Chi tiết sản phẩm hoàn kho',
                  key: 'items',
                  render: (_: any, r: any) => (
                    <ul style={{ paddingLeft: 16, margin: 0, fontSize: 12 }}>
                      {r.items?.map((i: any, idx: number) => (
                        <li key={idx}>
                          <strong>{i.productName}</strong>: +{i.quantity} {i.unit} ➔ <Tag color="green" style={{ fontSize: 11 }}>{i.batchCode}</Tag>
                        </li>
                      ))}
                    </ul>
                  )
                },
                { title: 'Tiền hoàn lại', dataIndex: 'totalAmount', key: 'totalAmount', render: (v: any) => <strong style={{ color: '#FF4D4F' }}>{Number(v).toLocaleString('vi-VN')} ₫</strong> },
                {
                  title: 'Trạng thái kho',
                  key: 'status',
                  render: () => <Tag color="green" icon={<CheckCircleOutlined />}>Đã hoàn kho (ACID)</Tag>
                },
              ] as any}
              pagination={{ pageSize: 8 }}
            />
          </div>
        )}
      </Drawer>
    </div>
  );
};
