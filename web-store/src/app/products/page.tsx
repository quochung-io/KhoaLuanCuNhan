'use client';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import SearchBar from '@/components/layout/SearchBar';

const ICONS: Record<string, React.ReactNode> = {
  leaf: <svg viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="1.8"><path d="M12 21c-5-1-8-5-8-10A7 7 0 0112 3a7 7 0 018 8c0 5-3 9-8 10z"/><path d="M12 21V9"/></svg>,
  carrot: <svg viewBox="0 0 24 24" fill="none" stroke="#FF9800" strokeWidth="1.8"><path d="M14 3l3 3M17 2l2 2M19 5l2-1M4 20l9-9 3 3-9 9-4 1 1-4z"/></svg>,
  citrus: <svg viewBox="0 0 24 24" fill="none" stroke="#FF9800" strokeWidth="1.8"><circle cx="12" cy="13" r="7"/><path d="M12 6c1-2 3-3 4-3"/><path d="M12 13l4-4M12 13l-4 4M12 13l4 4M12 13l-4-4"/></svg>,
  egg: <svg viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth="1.8"><path d="M12 21c4 0 7-3.5 7-8 0-5-4-10-7-10S5 8 5 13c0 4.5 3 8 7 8z"/></svg>,
  jar: <svg viewBox="0 0 24 24" fill="none" stroke="#2E5C8A" strokeWidth="1.8"><path d="M8 3h8v3H8z"/><path d="M6 6h12l-1 15H7L6 6z"/></svg>,
  berry: <svg viewBox="0 0 24 24" fill="none" stroke="#8E44AD" strokeWidth="1.8"><circle cx="9" cy="14" r="4"/><circle cx="15" cy="14" r="4"/><path d="M12 10V5M12 5c1-1.5 3-2 4-1.5"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7l-9 9-4-4"/></svg>
};

type Product = {
  id: number;
  name: string;
  price: string;
  rawPrice: number;
  unit: string;
  category: string;
  cert: string;
  region: string;
  rating: number;
  reviews: number;
  icon: string;
  lot: string;
  imageUrl?: string;
  isOutOfStock?: boolean;
  availableStock?: number;
};

const initialProducts: Product[] = [
  {id:1, name:'Cải bó xôi hữu cơ', category:'Rau củ', price:'28.000₫', rawPrice: 28000, unit:'/ 300g', cert:'VietGAP', region:'Đà Lạt', rating:4.8, reviews:212, icon:'leaf', lot:'LOT#VN-DL-0842', imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80'},
  {id:2, name:'Cà rốt baby Đà Lạt', category:'Rau củ', price:'32.000₫', rawPrice: 32000, unit:'/ 500g', cert:'GlobalGAP', region:'Đà Lạt', rating:4.9, reviews:184, icon:'carrot', lot:'LOT#VN-DL-0917', imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&auto=format&fit=crop&q=80'},
  {id:3, name:'Cam Cao Phong', category:'Trái cây', price:'45.000₫', rawPrice: 45000, unit:'/ kg', cert:'VietGAP', region:'Mộc Châu', rating:4.7, reviews:301, icon:'citrus', lot:'LOT#VN-MC-1140', imageUrl: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=600&auto=format&fit=crop&q=80'},
  {id:4, name:'Trứng gà ta thả vườn', category:'Rau củ', price:'52.000₫', rawPrice: 52000, unit:'/ hộp 10', cert:'USDA', region:'Đồng Tháp', rating:5.0, reviews:96, icon:'egg', lot:'LOT#VN-DT-0663', imageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&auto=format&fit=crop&q=80'},
  {id:5, name:'Mật ong rừng nguyên chất', category:'Hạt', price:'135.000₫', rawPrice: 135000, unit:'/ 500ml', cert:'USDA', region:'Mộc Châu', rating:4.9, reviews:158, icon:'jar', lot:'LOT#VN-MC-0255', imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80'},
  {id:6, name:'Dâu tây Mộc Châu', category:'Trái cây', price:'68.000₫', rawPrice: 68000, unit:'/ hộp 250g', cert:'GlobalGAP', region:'Mộc Châu', rating:4.8, reviews:243, icon:'berry', lot:'LOT#VN-MC-0389', imageUrl: 'https://images.unsplash.com/photo-1518635017498-87f514b751ba?w=600&auto=format&fit=crop&q=80'},
  {id:7, name:'Xà lách xoăn thủy canh', category:'Rau củ', price:'22.000₫', rawPrice: 22000, unit:'/ 250g', cert:'VietGAP', region:'Đà Lạt', rating:4.6, reviews:120, icon:'leaf', lot:'LOT#VN-DL-0721', imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80'},
  {id:8, name:'Bơ 034 Đắk Lắk', category:'Trái cây', price:'58.000₫', rawPrice: 58000, unit:'/ kg', cert:'VietGAP', region:'Đồng Tháp', rating:4.8, reviews:167, icon:'citrus', lot:'LOT#VN-DT-0410', imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&auto=format&fit=crop&q=80'},
];

type CartItem = {
  product: Product;
  qty: number;
};

type SuggestionItem = {
  productId: number;
  productName: string;
  price: number;
  unit: string;
  imageUrl?: string;
};

function AllProductsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get('search') || '';
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('light');
  const [lang, setLang] = useState('vi');

  // Tài khoản
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Giỏ hàng
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const [addedItem, setAddedItem] = useState<number | null>(null);

  // Bộ lọc & Sắp xếp
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterCert, setFilterCert] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');
  const [filterRating, setFilterRating] = useState<'all' | 'high' | 'mid' | 'unreviewed'>('all');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [sortOrder, setSortOrder] = useState<'default' | 'price-asc' | 'price-desc' | 'rating-desc' | 'rating-asc'>('default');

  // Quick View State
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [quickViewQty, setQuickViewQty] = useState(1);
  const [boughtTogether, setBoughtTogether] = useState<any[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [recToast, setRecToast] = useState('');
  const [selectedTopKIds, setSelectedTopKIds] = useState<number[]>([]);
  const [quickViewHistory, setQuickViewHistory] = useState<Product[]>([]);
  const [quickViewBatches, setQuickViewBatches] = useState<any[]>([]);
  const [isQuickViewOutOfStock, setIsQuickViewOutOfStock] = useState<boolean>(false);
  const [quickViewAvailableStock, setQuickViewAvailableStock] = useState<number>(0);
  const quickViewCarouselRef = React.useRef<HTMLDivElement>(null);

  const [openQrFor, setOpenQrFor] = useState<number | null>(null);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  // Load User & Cart từ localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('customer_user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {}
    }

    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {}
    }
  }, []);

  // Click outside to close user dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lưu giỏ hàng khi thay đổi
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('cart');
    }
  }, [cart]);

  // Khi mở Quick View: Ghi nhận hành vi & tải gợi ý Thường mua cùng Top-6 + kiểm tra tồn kho lô hàng
  useEffect(() => {
    if (quickViewProduct) {
      setLoadingRecommendations(true);
      // Ghi nhận hành vi QUICK_VIEW (thu thập hành vi người dùng)
      fetch('http://localhost:5023/api/recommendations/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: quickViewProduct.id,
          actionType: 'QUICK_VIEW',
          userId: currentUser?.userId || null
        })
      }).catch(() => {});

      // Kiểm tra tồn kho lô hàng thực tế của món đang xem
      fetch(`http://localhost:5023/api/productbatches?productId=${quickViewProduct.id}`)
        .then(res => res.json())
        .then((batchList: any[]) => {
          if (Array.isArray(batchList)) {
            setQuickViewBatches(batchList);
            const activeBatches = batchList.filter(b => {
              const notExpired = !b.expiryDate || new Date(b.expiryDate) >= new Date();
              const hasQty = (b.initialQuantity || 0) > 0;
              const isActive = b.status === 'Active' || !b.status;
              return notExpired && hasQty && isActive;
            });
            const totalStock = activeBatches.reduce((sum, b) => sum + (b.initialQuantity || 0), 0);
            setQuickViewAvailableStock(totalStock);
            setIsQuickViewOutOfStock(batchList.length > 0 && totalStock <= 0);
          } else {
            setQuickViewBatches([]);
            setQuickViewAvailableStock(0);
            setIsQuickViewOutOfStock(false);
          }
        })
        .catch(() => {
          setQuickViewBatches([]);
          setQuickViewAvailableStock(0);
          setIsQuickViewOutOfStock(false);
        });

      // Lấy danh sách Top-6 nông sản thường mua cùng từ mô-đun AI Recommendation
      fetch(`http://localhost:5023/api/recommendations/frequently-bought-together/${quickViewProduct.id}?limit=6`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setBoughtTogether(data);
            // Mặc định chỉ chọn các món CÒN HÀNG (tối đa 2 món) để tạo combo gọn gàng
            const inStockRecs = data.filter((i: any) => !i.isOutOfStock);
            setSelectedTopKIds(inStockRecs.slice(0, 2).map((i: any) => i.productId));
          } else {
            setBoughtTogether([]);
            setSelectedTopKIds([]);
          }
        })
        .catch(() => {
          setBoughtTogether([]);
          setSelectedTopKIds([]);
        })
        .finally(() => setLoadingRecommendations(false));
    } else {
      setBoughtTogether([]);
      setSelectedTopKIds([]);
      setQuickViewBatches([]);
      setQuickViewAvailableStock(0);
      setIsQuickViewOutOfStock(false);
    }
  }, [quickViewProduct, currentUser]);

  const toggleTopKSelection = (id: number) => {
    const item = boughtTogether.find(x => x.productId === id);
    if (item?.isOutOfStock) {
      alert('Sản phẩm này hiện đang tạm hết hàng, không thể thêm vào combo.');
      return;
    }
    setSelectedTopKIds((prev: number[]) =>
      prev.includes(id) ? prev.filter((x: number) => x !== id) : [...prev, id]
    );
  };

  const handleAddRecommendedToCart = (item: any) => {
    if (item.isOutOfStock) {
      alert(`Sản phẩm "${item.productName}" hiện đang tạm hết hàng, không thể thêm vào giỏ.`);
      return;
    }
    const p: Product = {
      id: item.productId,
      name: item.productName,
      price: item.formattedPrice,
      rawPrice: item.price,
      unit: item.unit ? ` / ${item.unit}` : ' / kg',
      category: item.categoryName || 'Nông sản',
      cert: 'VietGAP',
      region: 'Đà Lạt',
      rating: item.averageRating,
      reviews: item.reviewsCount,
      icon: 'leaf',
      lot: 'LOT#VN-REC-' + item.productId,
      imageUrl: item.imageUrl
    };
    addToCart(p, 1);

    // Ghi nhận sự kiện click vào gợi ý (phục vụ tính CTR & Conversion Rate trên Dashboard)
    fetch('http://localhost:5023/api/recommendations/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: item.productId,
        actionType: 'RECOMMENDATION_CLICK',
        recommendationType: 'FREQUENTLY_BOUGHT_TOGETHER',
        userId: currentUser?.userId || null
      })
    }).catch(() => {});

    setRecToast(`Đã thêm "${item.productName}" vào giỏ hàng!`);
    setTimeout(() => setRecToast(''), 2500);
  };

  const handleDrillDownProduct = async (item: any) => {
    if (!quickViewProduct) return;
    setQuickViewHistory(prev => [...prev, quickViewProduct]);

    // Ghi nhận sự kiện click vào gợi ý
    fetch('http://localhost:5023/api/recommendations/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: item.productId,
        actionType: 'RECOMMENDATION_CLICK',
        recommendationType: 'FREQUENTLY_BOUGHT_TOGETHER',
        userId: currentUser?.userId || null
      })
    }).catch(() => {});

    // Tìm trong danh sách products đã tải
    const found = products.find(p => p.id === item.productId);
    if (found) {
      setQuickViewProduct(found);
      setQuickViewQty(1);
      return;
    }

    // Nạp chi tiết từ API nếu cần
    try {
      const res = await fetch(`http://localhost:5023/api/products/${item.productId}`);
      if (res.ok) {
        const data = await res.json();
        const newP: Product = {
          id: data.productId,
          name: data.productName,
          category: data.category?.categoryName || item.categoryName || 'Nông sản',
          price: data.price ? data.price.toLocaleString('vi-VN') + '₫' : item.formattedPrice || '0₫',
          rawPrice: data.price || item.price || 0,
          unit: data.unit ? ` / ${data.unit}` : (item.unit ? ` / ${item.unit}` : ' / kg'),
          cert: 'VietGAP',
          region: 'Đà Lạt',
          rating: data.averageRating || item.averageRating || 5,
          reviews: data.reviewsCount || item.reviewsCount || 10,
          icon: 'leaf',
          lot: `LOT#VN-DL-${String(data.productId).padStart(4, '0')}`,
          imageUrl: data.productImages?.[0]?.imageUrl || item.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600'
        };
        setQuickViewProduct(newP);
        setQuickViewQty(1);
        return;
      }
    } catch (e) {}

    // Fallback
    const fallbackP: Product = {
      id: item.productId,
      name: item.productName,
      category: item.categoryName || 'Nông sản',
      price: item.formattedPrice || (typeof item.price === 'number' ? item.price.toLocaleString('vi-VN') + '₫' : '0₫'),
      rawPrice: typeof item.price === 'number' ? item.price : 0,
      unit: item.unit ? ` / ${item.unit}` : ' / kg',
      cert: 'VietGAP',
      region: 'Đà Lạt',
      rating: item.averageRating || 5,
      reviews: item.reviewsCount || 10,
      icon: 'leaf',
      lot: 'LOT#VN-REC-' + item.productId,
      imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600'
    };
    setQuickViewProduct(fallbackP);
    setQuickViewQty(1);
  };

  const handleBackQuickView = () => {
    if (quickViewHistory.length === 0) return;
    const previous = quickViewHistory[quickViewHistory.length - 1];
    setQuickViewHistory(prev => prev.slice(0, -1));
    setQuickViewProduct(previous);
    setQuickViewQty(1);
  };

  const handleAddAllComboToCart = () => {
    if (!quickViewProduct) return;
    if (isQuickViewOutOfStock) {
      alert('Sản phẩm chính hiện đang tạm hết hàng, không thể mua trọn bộ combo này.');
      return;
    }
    const selectedItems = boughtTogether.filter((item: any) => selectedTopKIds.includes(item.productId) && !item.isOutOfStock);
    const hasDiscount = selectedItems.length >= 1;

    // 1. Thêm sản phẩm chính (giảm 5% nếu mua combo từ 2 món trở lên)
    const mainRawPrice = quickViewProduct.rawPrice || parseInt((quickViewProduct.price || '').replace(/[^\d]/g, ''), 10) || 0;
    if (hasDiscount) {
      const discountedMainPrice = Math.round(mainRawPrice * 0.95);
      addToCart({
        ...quickViewProduct,
        price: discountedMainPrice.toLocaleString('vi-VN') + '₫',
        rawPrice: discountedMainPrice
      }, quickViewQty);
    } else {
      addToCart(quickViewProduct, quickViewQty);
    }

    // 2. Thêm các món Top-K được chọn (giảm 5% nếu mua combo)
    selectedItems.forEach((item: any) => {
      const rawPrice = item.price || 0;
      const discountedPrice = hasDiscount ? Math.round(rawPrice * 0.95) : rawPrice;
      const p: Product = {
        id: item.productId,
        name: item.productName,
        price: discountedPrice.toLocaleString('vi-VN') + '₫',
        rawPrice: discountedPrice,
        unit: item.unit ? ` / ${item.unit}` : ' / kg',
        category: item.categoryName || 'Nông sản',
        cert: 'VietGAP',
        region: 'Đà Lạt',
        rating: item.averageRating,
        reviews: item.reviewsCount,
        icon: 'leaf',
        lot: 'LOT#VN-REC-' + item.productId,
        imageUrl: item.imageUrl
      };
      addToCart(p, 1);

      // Ghi nhận sự kiện click
      fetch('http://localhost:5023/api/recommendations/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: item.productId,
          actionType: 'RECOMMENDATION_CLICK',
          recommendationType: 'FREQUENTLY_BOUGHT_TOGETHER',
          userId: currentUser?.userId || null
        })
      }).catch(() => {});
    });

    setRecToast(hasDiscount 
      ? `🎉 Đã thêm combo ${1 + selectedItems.length} món (Tiết kiệm 5%) vào giỏ hàng!` 
      : `Đã thêm sản phẩm vào giỏ hàng!`
    );
    setTimeout(() => setRecToast(''), 3000);
    setQuickViewProduct(null);
    setQuickViewHistory([]);
    setIsDrawerOpen(true);
  };

  // Gọi API lấy danh sách sản phẩm
  const fetchProducts = (searchVal = searchQuery, minP = minPrice, maxP = maxPrice) => {
    setLoading(true);
    let url = 'http://localhost:5023/api/products';
    const params: string[] = [];
    if (searchVal) params.push(`search=${encodeURIComponent(searchVal)}`);
    if (minP !== '') params.push(`minPrice=${minP}`);
    if (maxP !== '') params.push(`maxPrice=${maxP}`);
    if (params.length > 0) url += '?' + params.join('&');

    fetch(url)
      .then(res => res.json())
      .then((data: any[]) => {
        if (data && Array.isArray(data)) {
          const nonCombos = data.filter((item: any) => !(item.productName || '').toLowerCase().includes('combo'));
          const mapped = nonCombos.map((item: any) => {
            let icon = 'leaf';
            const nameLower = (item.productName || '').toLowerCase();
            if (nameLower.includes('cà rốt') || nameLower.includes('củ')) icon = 'carrot';
            else if (nameLower.includes('cam') || nameLower.includes('chanh') || nameLower.includes('quýt') || nameLower.includes('bưởi') || nameLower.includes('sầu riêng') || nameLower.includes('bơ')) icon = 'citrus';
            else if (nameLower.includes('trứng') || nameLower.includes('gà') || nameLower.includes('thịt')) icon = 'egg';
            else if (nameLower.includes('mật ong') || nameLower.includes('mứt') || nameLower.includes('hũ') || nameLower.includes('lọ')) icon = 'jar';
            else if (nameLower.includes('dâu') || nameLower.includes('berry') || nameLower.includes('nho')) icon = 'berry';

            let imageUrl = '';
            if (item.productImages && item.productImages.length > 0) {
              const primary = item.productImages.find((img: any) => img.isPrimary);
              imageUrl = primary ? primary.imageUrl : item.productImages[0].imageUrl;
            }

            let region = 'Đà Lạt';
            if (nameLower.includes('mộc châu') || nameLower.includes('bắc hà') || nameLower.includes('tây bắc') || nameLower.includes('sapa') || nameLower.includes('hàm yên') || nameLower.includes('chi lăng')) {
              region = 'Mộc Châu';
            } else if (nameLower.includes('đồng tháp') || nameLower.includes('miền tây') || nameLower.includes('bến tre') || nameLower.includes('tiền giang') || nameLower.includes('long an') || nameLower.includes('vũng tàu') || nameLower.includes('hưng yên') || nameLower.includes('ninh thuận')) {
              region = 'Đồng Tháp';
            }

            const regCode = region === 'Mộc Châu' ? 'MC' : region === 'Đồng Tháp' ? 'DT' : 'DL';
            const cert = (item.status === 'Active' || !item.status) ? 'VietGAP' : item.status;
            const catName = item.category?.categoryName || 'Rau củ';
            const rawPrice = Number(item.price) || 0;

            return {
              id: Number(item.productId),
              name: item.productName,
              price: rawPrice.toLocaleString('vi-VN') + '₫',
              rawPrice: rawPrice,
              unit: ' / ' + item.unit,
              category: catName,
              cert: cert,
              region: region,
              rating: item.averageRating != null ? Number(item.averageRating) : 0,
              reviews: item.reviewsCount != null ? Number(item.reviewsCount) : 0,
              icon: icon,
              lot: 'LOT#VN-' + regCode + '-' + (1000 + Number(item.productId)),
              imageUrl: imageUrl || undefined,
              isOutOfStock: Boolean(item.isOutOfStock),
              availableStock: Number(item.availableStock) || 0
            };
          });
          setProducts(mapped);
        }
      })
      .catch(err => console.error('Lỗi khi gọi API sản phẩm:', err))
      .finally(() => setLoading(false));
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (val.trim().length > 0) {
      fetch(`http://localhost:5023/api/products/autocomplete?prefix=${encodeURIComponent(val)}`)
        .then(res => res.json())
        .then((data: SuggestionItem[]) => {
          setSuggestions(data || []);
          setShowSuggestions(true);
        })
        .catch(() => setSuggestions([]));
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    const s = searchParams.get('search') || '';
    setSearchQuery(s);
    fetchProducts(s);
  }, [searchParams]);

  const handleCustomerLogout = () => {
    localStorage.removeItem('customer_user');
    setCurrentUser(null);
    setShowUserDropdown(false);
    window.location.reload();
  };

  const addToCart = (product: Product, quantity = 1) => {
    if (product.isOutOfStock) {
      alert(`Sản phẩm "${product.name}" hiện đang tạm hết hàng hoặc hết hạn sử dụng, không thể thêm vào giỏ.`);
      return;
    }
    setCart(prev => {
      const existing = prev.find(x => x.product.id === product.id);
      if (existing) {
        return prev.map(x => (x.product.id === product.id ? { ...x, qty: x.qty + quantity } : x));
      }
      return [...prev, { product, qty: quantity }];
    });
    setCartBounce(false);
    setTimeout(() => setCartBounce(true), 10);
    setAddedItem(product.id);
    setTimeout(() => setAddedItem(null), 900);
  };

  const updateCartQty = (id: number, delta: number) => {
    setCart(prev =>
      prev.map(x => {
        if (x.product.id === id) {
          return { ...x, qty: Math.max(1, x.qty + delta) };
        }
        return x;
      })
    );
  };

  const setCartItemQty = (id: number, exactQty: number) => {
    const safe = Math.max(1, Math.min(999, isNaN(exactQty) ? 1 : exactQty));
    setCart(prev =>
      prev.map(x => {
        if (x.product.id === id) {
          return { ...x, qty: safe };
        }
        return x;
      })
    );
  };

  const removeFromCart = (id: number) => setCart(prev => prev.filter(x => x.product.id !== id));

  const totalCart = cart.reduce((s, i) => s + (i.product.rawPrice || parseInt(i.product.price.replace(/[^\d]/g, ''), 10)) * i.qty, 0);
  const toVND = (n: number) => n.toLocaleString('vi-VN') + '₫';

  const handleGoToCheckout = () => {
    if (!currentUser) {
      alert('Vui lòng đăng nhập trước khi thực hiện thanh toán!');
      router.push('/login');
      return;
    }
    if (cart.length === 0) {
      alert('Giỏ hàng của bạn đang trống!');
      return;
    }
    setIsDrawerOpen(false);
    router.push('/checkout');
  };

  const openQuickView = (p: Product) => {
    setQuickViewProduct(p);
    setQuickViewQty(1);
  };

  // Lọc và Sắp xếp
  const filteredProducts = products.filter(p => {
    const matchCat = filterCategory === 'all' || p.category === filterCategory;
    const matchCert = filterCert === 'all' || p.cert === filterCert;
    const matchRegion = filterRegion === 'all' || p.region === filterRegion;
    const matchRating = filterRating === 'all'
      ? true
      : filterRating === 'high'
      ? p.rating >= 4.5 && p.reviews > 0
      : filterRating === 'mid'
      ? p.rating >= 3.0 && p.rating < 4.5 && p.reviews > 0
      : filterRating === 'unreviewed'
      ? p.reviews === 0
      : true;
    return matchCat && matchCert && matchRegion && matchRating;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOrder === 'price-asc') return a.rawPrice - b.rawPrice;
    if (sortOrder === 'price-desc') return b.rawPrice - a.rawPrice;
    if (sortOrder === 'rating-desc') return b.rating - a.rating;
    if (sortOrder === 'rating-asc') return a.rating - b.rating;
    return 0;
  });

  return (
    <>
      <header>
        {/* ── TẦNG 1: TOP BAR TIỆN ÍCH ── */}
        <div className="header-topbar">
          <div className="wrap topbar-row">
            <div className="topbar-left">
              <span><strong>LÀNH Farm</strong> - Nông sản sạch chuẩn VietGAP & Hữu cơ</span>
              <span style={{ opacity: 0.4 }}>|</span>
              <span className="topbar-link">Hotline: <strong>1900 8899</strong> (7:00 - 21:00)</span>
            </div>
            <div className="topbar-right">
              <a href="http://localhost:5174" target="_blank" rel="noreferrer" className="topbar-link">
                Kênh Đối Tác / HTX
              </a>
              <span style={{ opacity: 0.4 }}>|</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button className="icon-btn" onClick={toggleTheme} style={{ width: '24px', height: '24px' }} title="Sáng / Tối">
                  {theme === "light" ? "Tối" : "Sáng"}
                </button>
                <div className="lang-switch">
                  <button className={lang === 'vi' ? 'active' : ''} onClick={() => setLang('vi')}>VI</button>
                  <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── TẦNG 2: MAIN HEADER (LOGO, SEARCH, USER, CART) ── */}
        <div className="wrap nav-row">
          <Link href="/" className="logo">
            <svg className="mark" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="20" fill="var(--green-700)"/>
              <path d="M20 30C20 30 12 26 12 18C12 13 16 10 20 10C24 10 28 13 28 18C28 26 20 30 20 30Z" fill="var(--green-500)"/>
              <path d="M20 30V16" stroke="var(--green-900)" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <div>
              <span style={{ letterSpacing: '1px' }}>LÀNH</span>
              <div style={{ fontSize: '10.5px', fontWeight: '500', color: 'var(--green-700)', marginTop: '-4px' }}>NÔNG SẢN TƯƠI SẠCH</div>
            </div>
          </Link>

          {/* Thanh tìm kiếm trung tâm */}
          <SearchBar 
            initialValue={searchQuery}
            onSearchSubmit={(val) => {
              setSearchQuery(val);
              if (val) {
                router.push(`/products?search=${encodeURIComponent(val)}`);
              } else {
                router.push('/products');
              }
            }}
          />

          {/* Nhóm nút tác vụ Header */}
          <div className="header-actions">
            {/* Mục Tài khoản */}
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button 
                className="header-action-item" 
                onClick={() => setShowUserDropdown(!showUserDropdown)} 
                style={{ border: 'none', background: 'none' }}
              >
                <span className="header-action-icon">
                  {currentUser && currentUser.avatarUrl ? (
                    <img 
                      src={currentUser.avatarUrl} 
                      alt="Avatar" 
                      style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--green-700)' }} 
                    />
                  ) : ''}
                </span>
                <div className="header-action-text">
                  <span className="header-action-label">{currentUser ? 'Xin chào,' : 'Tài khoản'}</span>
                  <span className="header-action-value" style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentUser ? currentUser.fullName : 'Đăng nhập'}
                  </span>
                </div>
              </button>
              
              {showUserDropdown && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--line)',
                  borderRadius: '10px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                  zIndex: 1000,
                  width: '200px',
                  padding: '6px 0',
                  textAlign: 'left'
                }}>
                  {currentUser ? (
                    <>
                      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--line)', fontSize: '12px', color: 'var(--ink-soft)' }}>
                        <div style={{ fontWeight: '700', color: 'var(--ink)', fontSize: '13.5px' }}>{currentUser.fullName}</div>
                        <div style={{ marginTop: '2px' }}>{currentUser.email}</div>
                      </div>
                      <Link 
                        href="/profile"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 14px',
                          textDecoration: 'none',
                          color: 'var(--ink)',
                          fontSize: '13px',
                          fontWeight: '500',
                          borderBottom: '1px solid var(--line)'
                        }}
                      >
                        Hồ sơ & Sổ địa chỉ
                      </Link>
                      <Link 
                        href="/orders"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 14px',
                          textDecoration: 'none',
                          color: 'var(--ink)',
                          fontSize: '13px',
                          fontWeight: '500',
                          borderBottom: '1px solid var(--line)'
                        }}
                      >
                        Lịch sử đơn hàng
                      </Link>
                      <button 
                        onClick={handleCustomerLogout}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: 'none',
                          background: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                          color: '#e53e3e',
                          fontSize: '13px',
                          fontWeight: '700',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        Đăng xuất
                      </button>
                    </>
                  ) : (
                    <>
                      <Link 
                        href="/login"
                        style={{
                          display: 'block',
                          padding: '10px 14px',
                          textDecoration: 'none',
                          color: 'var(--ink)',
                          fontSize: '13px',
                          fontWeight: '600'
                        }}
                      >
                        Đăng nhập
                      </Link>
                      <Link 
                        href="/register"
                        style={{
                          display: 'block',
                          padding: '10px 14px',
                          textDecoration: 'none',
                          color: 'var(--green-700)',
                          fontSize: '13px',
                          fontWeight: '600'
                        }}
                      >
                        Đăng ký thành viên
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Nút Giỏ Hàng nổi bật */}
            <div 
              className={`header-cart-btn ${cartBounce ? 'bounce' : ''}`}
              onClick={() => setIsDrawerOpen(true)}
              title="Xem giỏ hàng"
            >
              <div className="header-action-icon" style={{ display: 'flex', alignItems: 'center' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg><span className="badge">{cart.reduce((s, i) => s + i.qty, 0)}</span>
              </div>
              <div className="header-action-text">
                <span className="header-action-label">Giỏ hàng</span>
                <span className="header-action-value" style={{ color: 'var(--green-900)' }}>
                  {toVND(totalCart)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── TẦNG 3: SUB-NAVBAR 4 MỤC ĐIỀU HƯỚNG CHÍNH ── */}
        <div className="header-subnav">
          <div className="wrap subnav-row">
            <div className="subnav-links">
              <Link href="/" className="subnav-link">
                Trang chủ
              </Link>
              <Link href="/products" className="subnav-link active" style={{ color: 'var(--green-700)', fontWeight: '700' }}>
                Tất cả nông sản
              </Link>
              <Link href="/combos" className="subnav-link">
                Combo định kỳ
              </Link>
              <Link href="/traceability" className="subnav-link">
                Truy xuất nguồn gốc
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main style={{ minHeight: '80vh', paddingBottom: '60px' }}>
        {/* Banner tiêu đề trang */}
        <div style={{
          background: 'linear-gradient(135deg, var(--green-900) 0%, var(--green-700) 100%)',
          color: '#FFFFFF',
          padding: '36px 0',
          marginBottom: '28px',
          boxShadow: '0 4px 15px rgba(27, 58, 32, 0.15)'
        }}>
          <div className="wrap">
            <span style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--accent)', fontWeight: 'bold' }}>
              Danh mục sản phẩm chính thức
            </span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', margin: '8px 0 6px 0', color: '#FFFFFF' }}>
              Tất Cả Nông Sản Sạch &amp; Hữu Cơ
            </h1>
            <p style={{ margin: 0, fontSize: '14.5px', opacity: 0.9, maxWidth: '650px' }}>
              Nông sản tươi xanh thu hoạch mỗi sáng sớm từ các HTX đối tác tại Đà Lạt, Mộc Châu, Đồng Tháp. Kiểm định nghiêm ngặt chuẩn VietGAP, GlobalGAP và USDA Organic.
            </p>
          </div>
        </div>

        <div className="wrap">
          {/* THANH BỘ LỌC TỔNG HỢP & SẮP XẾP */}
          <div style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: '16px',
            padding: '20px 24px',
            marginBottom: '28px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
          }}>
            {/* Hàng 1: Danh mục & Sắp xếp */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--ink)', marginRight: '6px' }}>Danh mục:</span>
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: 'Rau củ', label: 'Rau củ hữu cơ' },
                  { id: 'Trái cây', label: 'Trái cây theo mùa' },
                  { id: 'Rau thơm', label: 'Rau thơm gia vị' },
                  { id: 'Hạt', label: 'Các loại hạt & Mật' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    className={`chip ${filterCategory === cat.id ? 'active' : ''}`}
                    onClick={() => setFilterCategory(cat.id)}
                    style={{ fontSize: '13px', padding: '6px 14px' }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Sắp xếp theo giá */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--ink)' }}>⇅ Sắp xếp:</span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--line)',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--ink)',
                    fontSize: '13px',
                    fontWeight: '600',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="default">Sắp xếp: Mặc định</option>
                  <option value="rating-desc">Đánh giá: Cao → Thấp ★★★★★</option>
                  <option value="rating-asc">Đánh giá: Thấp → Cao ★☆☆☆☆</option>
                  <option value="price-asc">Giá: Thấp → Cao</option>
                  <option value="price-desc">Giá: Cao → Thấp</option>
                </select>
              </div>
            </div>

            {/* Hàng 2: Vùng miền, Chứng nhận & Khoảng giá */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '14px', paddingTop: '14px', borderTop: '1px dashed var(--line)' }}>
              {/* Vùng miền */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--ink)' }}>Vùng miền:</span>
                {['all', 'Đà Lạt', 'Mộc Châu', 'Đồng Tháp'].map(r => (
                  <button
                    key={r}
                    className={`chip ${filterRegion === r ? 'active' : ''}`}
                    onClick={() => setFilterRegion(r)}
                  >
                    {r === 'all' ? 'Tất cả vùng' : r}
                  </button>
                ))}
              </div>

              <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--line)' }}></div>

              {/* Chứng nhận */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--ink)' }}>Chứng nhận:</span>
                {['all', 'VietGAP', 'GlobalGAP', 'USDA'].map(c => (
                  <button
                    key={c}
                    className={`chip ${filterCert === c ? 'active' : ''}`}
                    onClick={() => setFilterCert(c)}
                  >
                    {c === 'all' ? 'Tất cả chuẩn' : (c === 'USDA' ? 'USDA Organic' : c)}
                  </button>
                ))}
              </div>

              <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--line)' }}></div>

              {/* Khoảng giá */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--ink)' }}>Khoảng giá:</span>
                <input 
                  type="number" 
                  placeholder="Tối thiểu" 
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  style={{ padding: '5px 10px', borderRadius: '8px', border: '1px solid var(--line)', width: '100px', fontSize: '12.5px', outline: 'none' }}
                />
                <span>-</span>
                <input 
                  type="number" 
                  placeholder="Tối đa" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  style={{ padding: '5px 10px', borderRadius: '8px', border: '1px solid var(--line)', width: '100px', fontSize: '12.5px', outline: 'none' }}
                />
                <button 
                  className="chip active" 
                  onClick={() => fetchProducts()}
                  style={{ cursor: 'pointer', border: 'none', background: 'var(--green-700)', color: 'white', fontWeight: 'bold' }}
                >
                  Lọc
                </button>
              </div>

              {/* Nút Xóa lọc nếu có đang lọc */}
              {(minPrice !== '' || maxPrice !== '' || filterCategory !== 'all' || filterCert !== 'all' || filterRegion !== 'all' || filterRating !== 'all' || sortOrder !== 'default' || searchQuery !== '') && (
                <button 
                  className="chip" 
                  onClick={() => {
                    setFilterCategory('all');
                    setFilterCert('all');
                    setFilterRegion('all');
                    setFilterRating('all');
                    setMinPrice('');
                    setMaxPrice('');
                    setSearchQuery('');
                    setSortOrder('default');
                    fetchProducts('', '', '');
                  }}
                  style={{ cursor: 'pointer', border: '1px solid #e53e3e', color: '#e53e3e', marginLeft: 'auto', fontWeight: '600' }}
                >
                  Xóa tất cả bộ lọc
                </button>
              )}
            </div>

            {/* Hàng 3: Chọn lọc theo mức Đánh giá */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', paddingTop: '12px', borderTop: '1px dashed var(--line)' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--ink)' }}>Lọc đánh giá:</span>
              {[
                { key: 'all', label: 'Tất cả mức sao' },
                { key: 'high', label: '⭐ Đánh giá cao (≥ 4.5★)' },
                { key: 'mid', label: '⭐ Đánh giá vừa (3.0★ - 4.4★)' },
                { key: 'unreviewed', label: '💬 Chưa có đánh giá (0★)' },
              ].map(item => (
                <button
                  key={item.key}
                  className={`chip ${filterRating === item.key ? 'active' : ''}`}
                  onClick={() => setFilterRating(item.key as any)}
                  style={{
                    cursor: 'pointer',
                    fontSize: '12.5px',
                    fontWeight: filterRating === item.key ? '700' : '500'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Banner kết quả tìm kiếm */}
          {searchQuery && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '18px',
              background: 'var(--green-100, #F4F8F4)',
              border: '1px solid var(--green-300, #C8E6C9)',
              padding: '12px 18px',
              borderRadius: '12px'
            }}>
              <span style={{ fontSize: '14px', color: 'var(--green-900)', fontWeight: '600' }}>
                🔍 Kết quả tìm kiếm cho từ khóa: <strong style={{ color: 'var(--green-700)' }}>"{searchQuery}"</strong> (Tìm thấy {sortedProducts.length} sản phẩm)
              </span>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  router.push('/products');
                }}
                style={{
                  border: 'none',
                  background: '#FFFFFF',
                  color: '#E53E3E',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                }}
              >
                ✕ Xóa tìm kiếm
              </button>
            </div>
          )}

          {/* Kết quả đếm */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <span style={{ fontSize: '14.5px', color: 'var(--ink-soft)' }}>
              Hiển thị <strong style={{ color: 'var(--green-700)' }}>{sortedProducts.length}</strong> sản phẩm phù hợp
            </span>
          </div>

          {/* GRID SẢN PHẨM */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-soft)' }}>
              
              Đang tải danh sách nông sản...
            </div>
          ) : sortedProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', backgroundColor: 'var(--surface)', borderRadius: '16px', border: '1px dashed var(--line)' }}>
              
              <h3 style={{ fontSize: '18px', color: 'var(--ink)', marginBottom: '8px' }}>Không tìm thấy sản phẩm nào</h3>
              <p style={{ color: 'var(--ink-soft)', fontSize: '14px', maxWidth: '400px', margin: '0 auto 16px auto' }}>
                Hãy thử chọn lại danh mục hoặc bỏ bớt các điều kiện lọc giá, vùng miền.
              </p>
              <button
                className="btn btn-accent"
                onClick={() => {
                  setFilterCategory('all');
                  setFilterCert('all');
                  setFilterRegion('all');
                  setMinPrice('');
                  setMaxPrice('');
                  setSearchQuery('');
                  fetchProducts('', '', '');
                }}
              >
                Xem tất cả nông sản
              </button>
            </div>
          ) : (
            <div className="prod-grid">
              {sortedProducts.map(p => (
                <div key={p.id} className="prod-card" style={{ cursor: 'pointer' }} onClick={() => openQuickView(p)}>
                  <div className="prod-media" style={{ background: 'var(--green-100)', position: 'relative' }}>
                    <div style={{ display: 'block', width: '100%', height: '100%' }}>
                      {p.imageUrl ? (
                        <img 
                          src={p.imageUrl} 
                          alt={p.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80';
                          }}
                        />
                      ) : (
                        ICONS[p.icon] || ICONS['leaf']
                      )}
                    </div>
                    <div className="tag-row" style={{ pointerEvents: 'auto' }}>
                      {p.isOutOfStock ? (
                        <span className="tag-cert" style={{ background: '#DC2626', color: '#fff', fontWeight: 700 }}>Tạm hết hàng</span>
                      ) : (
                        <span className="tag-cert" style={{ background: '#2E7D32', color: '#fff', fontWeight: 600 }}>{p.category}</span>
                      )}
                      <span className="tag-cert">{p.cert}</span>
                      <button className="qr-btn" onClick={(e) => { e.stopPropagation(); setOpenQrFor(p.id); }} aria-label="Xem truy xuất nguồn gốc" title="Xem mã lô truy xuất">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20v.01"/></svg>
                      </button>
                    </div>
                    <div className={`qr-panel ${openQrFor === p.id ? 'show' : ''}`} onClick={(e) => e.stopPropagation()}>
                      <button className="qr-close" onClick={(e) => { e.stopPropagation(); setOpenQrFor(null); }} aria-label="Đóng">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M6 6l12 12M18 6L6 18"/></svg>
                      </button>
                      <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="1.6"><rect x="2" y="2" width="7" height="7"/><rect x="15" y="2" width="7" height="7"/><rect x="2" y="15" width="7" height="7"/><path d="M15 15h3v3h-3zM21 15v3M15 21h3M21 21v.01M5 5h1M18 5h1M5 18h1"/></svg>
                      <span className="lot">{p.lot}</span>
                      <p>Thu hoạch tại {p.region} · Kiểm định {p.cert}<br/>Quét mã để xem nhật ký canh tác đầy đủ</p>
                    </div>
                  </div>
                  <div className="prod-body">
                    <span className="prod-origin">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/></svg>
                      Xuất xứ: {p.region}
                    </span>
                    <span className="prod-name" style={{ cursor: 'pointer', transition: 'color 0.2s', opacity: p.isOutOfStock ? 0.7 : 1 }}>
                      {p.name}
                    </span>
                    <div className="stars">
                      {p.reviews > 0 ? (
                        <>
                          <span className="fill">★</span> <strong>{p.rating.toFixed(1)}</strong> · {p.reviews} đánh giá
                        </>
                      ) : (
                        <span style={{ color: 'var(--ink-soft)', fontSize: '12px', fontStyle: 'italic' }}>Chưa có đánh giá</span>
                      )}
                    </div>
                    <div className="price-row">
                      <span className="price" style={{ color: p.isOutOfStock ? '#DC2626' : undefined }}>
                        {p.isOutOfStock ? 'Hết hàng' : p.price}<span>{p.isOutOfStock ? '' : p.unit}</span>
                      </span>
                      <button 
                        disabled={p.isOutOfStock}
                        className={`add-btn ${addedItem === p.id ? 'added' : ''} ${p.isOutOfStock ? 'disabled' : ''}`} 
                        style={p.isOutOfStock ? {
                          backgroundColor: '#E2E8F0',
                          color: '#94A3B8',
                          borderColor: '#CBD5E1',
                          cursor: 'not-allowed',
                          boxShadow: 'none'
                        } : undefined}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (p.isOutOfStock) {
                            alert(`Sản phẩm "${p.name}" hiện đang tạm hết hàng hoặc hết hạn sử dụng, không thể thêm vào giỏ.`);
                            return;
                          }
                          addToCart(p, 1);
                        }} 
                        aria-label={p.isOutOfStock ? 'Tạm hết hàng' : 'Thêm vào giỏ'}
                        title={p.isOutOfStock ? 'Sản phẩm tạm hết hàng / hết hạn' : 'Thêm nhanh vào giỏ'}
                      >
                        {p.isOutOfStock ? (
                          <span style={{ fontSize: '13px', fontWeight: 'bold' }}>✕</span>
                        ) : addedItem === p.id ? (
                          ICONS.check
                        ) : (
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 5v14M5 12h14"/></svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ── QUICK VIEW MODAL (XEM NHANH SẢN PHẨM) ── */}
      {quickViewProduct && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.2s ease'
          }}
          onClick={() => { setQuickViewProduct(null); setQuickViewHistory([]); }}
        >
          <div 
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: '24px',
              maxWidth: '920px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 25px 70px rgba(0,0,0,0.3)',
              position: 'relative',
              border: '1px solid var(--line)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút quay lại nếu xem từ sản phẩm gợi ý */}
            {quickViewHistory.length > 0 && (
              <button
                type="button"
                onClick={handleBackQuickView}
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  height: '36px',
                  borderRadius: '18px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--line)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0 14px',
                  cursor: 'pointer',
                  zIndex: 20,
                  color: 'var(--ink)',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}
                aria-label="Quay lại sản phẩm trước"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Quay lại ({quickViewHistory[quickViewHistory.length - 1].name.slice(0, 18)}...)
              </button>
            )}

            {/* Nút đóng Quick View */}
            <button
              onClick={() => { setQuickViewProduct(null); setQuickViewHistory([]); }}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg)',
                border: '1px solid var(--line)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 20,
                color: 'var(--ink)'
              }}
              aria-label="Đóng xem nhanh"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 6l12 12M18 6L6 18"/></svg>
            </button>

            {/* ── TẦNG 1: THÔNG TIN SẢN PHẨM CHÍNH (2 CỘT RỘNG RÃI) ── */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '0',
              position: 'relative'
            }}>
              {/* Cột trái: Hình ảnh sản phẩm lớn */}
              <div style={{
                backgroundColor: 'var(--green-100)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '340px'
              }}>
                {quickViewProduct.imageUrl ? (
                  <img
                    src={quickViewProduct.imageUrl}
                    alt={quickViewProduct.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                ) : (
                  <div style={{ width: '120px', height: '120px' }}>
                    {ICONS[quickViewProduct.icon] || ICONS['leaf']}
                  </div>
                )}

                {/* Tag nhãn trên ảnh */}
                <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '6px' }}>
                  <span style={{ backgroundColor: 'var(--green-700)', color: '#FFFFFF', padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 'bold' }}>
                    {quickViewProduct.category}
                  </span>
                  <span style={{ backgroundColor: '#FFFFFF', color: 'var(--green-900)', border: '1px solid var(--green-700)', padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 'bold' }}>
                    {quickViewProduct.cert}
                  </span>
                </div>
              </div>

              {/* Cột phải: Thông tin & Mua hàng */}
              <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--ink-soft)', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span>Xuất xứ: <strong>{quickViewProduct.region}</strong></span>
                    <span>•</span>
                    <span>Mã lô: <strong>{quickViewProduct.lot}</strong></span>
                    <span>•</span>
                    <span style={{ color: 'var(--green-700)', fontWeight: '700', background: 'var(--green-100)', padding: '2px 8px', borderRadius: '4px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      🌿 Hái sáng nay 05:30 • Đang rộ vụ
                    </span>
                  </div>

                  <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--ink)', margin: '0 0 10px 0', lineHeight: '1.3' }}>
                    {quickViewProduct.name}
                  </h2>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    {quickViewProduct.reviews > 0 ? (
                      <>
                        <div className="stars" style={{ fontSize: '14px' }}>
                          <span className="fill">{'★'.repeat(Math.min(5, Math.max(1, Math.round(quickViewProduct.rating))))}</span>
                          <span style={{ color: '#D1D5DB' }}>{'☆'.repeat(5 - Math.min(5, Math.max(1, Math.round(quickViewProduct.rating))))}</span>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--ink)' }}>{quickViewProduct.rating.toFixed(1)}</span>
                        <span style={{ fontSize: '12.5px', color: 'var(--ink-soft)' }}>({quickViewProduct.reviews} lượt đánh giá)</span>
                      </>
                    ) : (
                      <span style={{ fontSize: '13px', color: 'var(--ink-soft)', fontStyle: 'italic' }}>Chưa có đánh giá</span>
                    )}
                  </div>

                  <div style={{
                    backgroundColor: 'var(--bg)',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    marginBottom: '14px',
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '8px'
                  }}>
                    <span style={{ fontSize: '26px', fontWeight: '800', color: 'var(--green-900)' }}>
                      {quickViewProduct.price}
                    </span>
                    <span style={{ fontSize: '14px', color: 'var(--ink-soft)' }}>
                      {quickViewProduct.unit}
                    </span>
                  </div>

                  <div style={{ backgroundColor: '#F0FDF4', border: '1px dashed #86EFAC', borderRadius: '8px', padding: '9px 12px', fontSize: '12.5px', color: '#166534', marginBottom: '16px', lineHeight: '1.5' }}>
                    💡 <strong>Mẹo bảo quản:</strong> Giữ nhiệt độ 4°C trong ngăn mát tủ lạnh, không rửa nước trước khi lưu trữ để bảo toàn vitamin đến 7 ngày!
                  </div>

                  {/* Chọn số lượng */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px' }}>
                    <span style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--ink)' }}>Số lượng:</span>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '1.5px solid var(--line)',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      background: 'var(--surface)'
                    }}>
                      <button
                        type="button"
                        onClick={() => setQuickViewQty(q => Math.max(1, q - 1))}
                        style={{ width: '36px', height: '36px', border: 'none', background: 'var(--bg)', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', userSelect: 'none' }}
                        aria-label="Giảm"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={999}
                        step={1}
                        value={quickViewQty}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setQuickViewQty(isNaN(val) ? 1 : Math.max(1, Math.min(999, val)));
                        }}
                        style={{
                          width: '46px',
                          height: '36px',
                          textAlign: 'center',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          color: 'var(--ink)',
                          border: 'none',
                          background: 'transparent',
                          outline: 'none'
                        }}
                        aria-label="Số lượng sản phẩm"
                      />
                      <button
                        type="button"
                        onClick={() => setQuickViewQty(q => q + 1)}
                        style={{ width: '36px', height: '36px', border: 'none', background: 'var(--bg)', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', userSelect: 'none' }}
                        aria-label="Tăng"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#B45309', background: '#FEF3C7', padding: '7px 12px', borderRadius: '6px', marginBottom: '16px', fontWeight: '600' }}>
                    <span>🚚</span>
                    <span><strong>Ưu đãi:</strong> Freeship 30K cho đơn từ 150.000₫ • Giao hỏa tốc 2H</span>
                  </div>
                </div>

                {/* Nút thao tác món chính */}
                <div>
                  {isQuickViewOutOfStock && (
                    <div style={{
                      backgroundColor: '#FEE2E2',
                      color: '#B91C1C',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontWeight: '700',
                      marginBottom: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span>⚠️</span>
                      <span>Sản phẩm này hiện tại đang tạm hết hàng tại kho.</span>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '10px' }}>
                    <button
                      disabled={isQuickViewOutOfStock}
                      onClick={() => {
                        if (isQuickViewOutOfStock) return;
                        addToCart(quickViewProduct, quickViewQty);
                        setQuickViewProduct(null);
                      }}
                      className="btn btn-accent"
                      style={{
                        padding: '12px',
                        fontSize: '14px',
                        fontWeight: '800',
                        justifyContent: 'center',
                        borderRadius: '10px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        opacity: isQuickViewOutOfStock ? 0.5 : 1,
                        cursor: isQuickViewOutOfStock ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                      {isQuickViewOutOfStock ? 'Tạm Hết Hàng' : 'Thêm Vào Giỏ'}
                    </button>
                    <button
                      disabled={isQuickViewOutOfStock}
                      onClick={() => {
                        if (isQuickViewOutOfStock) return;
                        addToCart(quickViewProduct, quickViewQty);
                        setQuickViewProduct(null);
                        router.push('/checkout');
                      }}
                      style={{
                        padding: '12px',
                        fontSize: '14px',
                        fontWeight: '800',
                        borderRadius: '10px',
                        backgroundColor: isQuickViewOutOfStock ? '#94A3B8' : 'var(--green-700)',
                        color: '#FFFFFF',
                        border: 'none',
                        cursor: isQuickViewOutOfStock ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: isQuickViewOutOfStock ? 'none' : '0 4px 12px rgba(46,125,50,0.25)'
                      }}
                    >
                      Mua Ngay
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── TẦNG 2: SẢN PHẨM ĐI KÈM (CAROUSEL TOP-6 & HỘP COMBO ƯU ĐÃI 5%) ── */}
            {boughtTogether.length > 0 && (
              <div style={{
                borderTop: '1px solid var(--line)',
                backgroundColor: '#FAFAFA',
                padding: '16px 22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {/* Header thanh điều hướng Carousel & Lịch sử */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--ink)' }}>
                      Thường mua kèm
                    </h3>
                    <span style={{ fontSize: '12px', color: 'var(--green-700)', fontWeight: '600' }}>
                      • Tiết kiệm thêm 5% khi mua trọn combo
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {quickViewHistory.length > 0 && (
                      <button
                        type="button"
                        onClick={handleBackQuickView}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--green-700)',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          padding: 0,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          marginRight: '6px'
                        }}
                      >
                        ← Quay lại trước
                      </button>
                    )}

                    {/* Nút điều hướng Carousel < và > */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => quickViewCarouselRef.current?.scrollBy({ left: -220, behavior: 'smooth' })}
                        title="Cuộn sang trái"
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          border: '1px solid var(--line)',
                          backgroundColor: '#FFFFFF',
                          color: 'var(--ink)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          fontSize: '13px',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={() => quickViewCarouselRef.current?.scrollBy({ left: 220, behavior: 'smooth' })}
                        title="Cuộn sang phải"
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          border: '1px solid var(--line)',
                          backgroundColor: '#FFFFFF',
                          color: 'var(--ink)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          fontSize: '13px',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                      >
                        ›
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bố cục 2 phần: Dải trượt ngang (Left) & Hộp Tổng Tiền Cố Định (Right) */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr) 230px',
                  gap: '14px',
                  alignItems: 'center'
                }}>
                  {/* Cột Trái: Dải trượt ngang mượt mà (Carousel) */}
                  <div 
                    ref={quickViewCarouselRef}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      overflowX: 'auto',
                      paddingBottom: '4px',
                      scrollBehavior: 'smooth'
                    }}
                  >
                    {/* Card 1: Món chính (Luôn chọn) */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '10px',
                      backgroundColor: isQuickViewOutOfStock ? '#FEF2F2' : '#FFFFFF',
                      border: isQuickViewOutOfStock ? '1px solid #FCA5A5' : '1px solid var(--line)',
                      minWidth: '185px',
                      flexShrink: 0
                    }}>
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: isQuickViewOutOfStock ? '#DC2626' : 'var(--green-700)',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: '900',
                        flexShrink: 0
                      }}>
                        {isQuickViewOutOfStock ? '✕' : '✓'}
                      </div>
                      <img
                        src={quickViewProduct.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100'}
                        alt={quickViewProduct.name}
                        style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #E2E8F0', flexShrink: 0 }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '10px', color: '#64748B', fontWeight: '700' }}>
                            Món đang xem
                          </span>
                          {isQuickViewOutOfStock && (
                            <span style={{ fontSize: '9px', fontWeight: '800', color: '#DC2626', backgroundColor: '#FEE2E2', padding: '1px 4px', borderRadius: '3px' }}>
                              Tạm hết
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={quickViewProduct.name}>
                          {quickViewProduct.name}
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: isQuickViewOutOfStock ? '#DC2626' : 'var(--green-700)' }}>
                          {isQuickViewOutOfStock ? 'Hết hàng' : quickViewProduct.price}
                        </div>
                      </div>
                    </div>

                    {/* Dấu cộng + */}
                    <div style={{ color: '#94A3B8', fontSize: '15px', fontWeight: '700', flexShrink: 0 }}>
                      +
                    </div>

                    {/* Danh sách các món gợi ý Top-6 */}
                    {boughtTogether.map((item: any, idx: number) => {
                      const isSelected = selectedTopKIds.includes(item.productId) && !item.isOutOfStock;
                      return (
                        <React.Fragment key={item.productId}>
                          <div 
                            onClick={() => handleDrillDownProduct(item)}
                            title={item.isOutOfStock ? `${item.productName} (Tạm hết hàng - Bấm để xem chi tiết)` : "Bấm để xem chi tiết sản phẩm này"}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 10px',
                              borderRadius: '10px',
                              backgroundColor: item.isOutOfStock ? '#F8FAFC' : '#FFFFFF',
                              border: isSelected ? '1.5px solid var(--green-700)' : '1px solid var(--line)',
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                              minWidth: '190px',
                              flexShrink: 0,
                              position: 'relative',
                              opacity: item.isOutOfStock ? 0.6 : 1
                            }}
                          >
                            {/* Checkbox chọn vào combo */}
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (item.isOutOfStock) {
                                  alert('Sản phẩm này hiện đang tạm hết hàng, không thể chọn vào combo.');
                                  return;
                                }
                                toggleTopKSelection(item.productId);
                              }}
                              title={item.isOutOfStock ? 'Sản phẩm tạm hết hàng' : (isSelected ? 'Bỏ chọn khỏi combo' : 'Chọn vào combo')}
                              style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '4px',
                                border: item.isOutOfStock ? '1.5px solid #E2E8F0' : (isSelected ? 'none' : '1.5px solid #CBD5E1'),
                                backgroundColor: item.isOutOfStock ? '#F1F5F9' : (isSelected ? 'var(--green-700)' : '#FFFFFF'),
                                color: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '10px',
                                fontWeight: '900',
                                flexShrink: 0,
                                cursor: item.isOutOfStock ? 'not-allowed' : 'pointer'
                              }}
                            >
                              {isSelected && '✓'}
                            </div>

                            <img
                              src={item.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100'}
                              alt={item.productName}
                              style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #E2E8F0', flexShrink: 0 }}
                            />

                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontSize: '9.5px', color: '#15803D', fontWeight: '700' }}>
                                  {item.recommendationReason || item.categoryName || 'Món bổ trợ'}
                                </span>
                                {item.isOutOfStock && (
                                  <span style={{ fontSize: '8.5px', fontWeight: '800', color: '#DC2626', backgroundColor: '#FEE2E2', padding: '1px 3px', borderRadius: '3px' }}>
                                    Hết hàng
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.productName}>
                                {item.productName}
                              </div>
                              <div style={{ fontSize: '11.5px', fontWeight: '700', color: item.isOutOfStock ? '#DC2626' : 'var(--green-700)' }}>
                                {item.isOutOfStock ? 'Tạm hết' : item.formattedPrice}
                              </div>
                            </div>

                            {/* Nút thêm lẻ */}
                            <button
                              type="button"
                              disabled={item.isOutOfStock}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddRecommendedToCart(item);
                              }}
                              title={item.isOutOfStock ? 'Sản phẩm tạm hết hàng' : 'Thêm riêng món này vào giỏ hàng'}
                              style={{
                                padding: '3px 7px',
                                borderRadius: '5px',
                                backgroundColor: item.isOutOfStock ? '#F1F5F9' : '#F8FAFC',
                                color: item.isOutOfStock ? '#94A3B8' : 'var(--green-700)',
                                border: '1px solid #CBD5E1',
                                fontSize: '10.5px',
                                fontWeight: '700',
                                cursor: item.isOutOfStock ? 'not-allowed' : 'pointer',
                                flexShrink: 0
                              }}
                            >
                              + Lẻ
                            </button>
                          </div>

                          {idx < boughtTogether.length - 1 && (
                            <div style={{ color: '#94A3B8', fontSize: '14px', fontWeight: '700', flexShrink: 0 }}>
                              +
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* Cột Phải: Hộp Cố Định Tổng Tiền Combo & Ưu Đãi 5% */}
                  {(() => {
                    const mainRawPrice = quickViewProduct.rawPrice || parseInt((quickViewProduct.price || '').replace(/[^\d]/g, ''), 10) || 0;
                    const selectedRecItems = boughtTogether.filter((item: any) => selectedTopKIds.includes(item.productId) && !item.isOutOfStock);
                    const rawTotal = (mainRawPrice * quickViewQty) + selectedRecItems.reduce((sum: number, item: any) => sum + (item.price || 0), 0);
                    const selectedCount = (isQuickViewOutOfStock ? 0 : 1) + selectedRecItems.length;
                    const hasDiscount = !isQuickViewOutOfStock && selectedCount >= 2;
                    const discountAmount = hasDiscount ? Math.round(rawTotal * 0.05) : 0;
                    const finalComboTotal = rawTotal - discountAmount;

                    return (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        backgroundColor: '#FFFFFF',
                        border: isQuickViewOutOfStock ? '1.5px dashed #FCA5A5' : '1.5px solid #86EFAC',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        flexShrink: 0
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>
                            Combo ({selectedCount} món):
                          </span>
                          {hasDiscount && (
                            <span style={{ fontSize: '10px', fontWeight: '800', color: '#15803D', backgroundColor: '#DCFCE7', padding: '1px 5px', borderRadius: '4px' }}>
                              -5% Giảm
                            </span>
                          )}
                        </div>

                        {isQuickViewOutOfStock ? (
                          <div style={{ fontSize: '11px', color: '#DC2626', fontWeight: '700', lineHeight: 1.3 }}>
                            ⚠️ Món chính đang hết hàng, không thể mua combo
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                            {hasDiscount && (
                              <span style={{ fontSize: '12px', color: '#94A3B8', textDecoration: 'line-through' }}>
                                {rawTotal.toLocaleString('vi-VN')}₫
                              </span>
                            )}
                            <span style={{ fontSize: '16px', fontWeight: '900', color: 'var(--green-700)' }}>
                              {finalComboTotal.toLocaleString('vi-VN')} ₫
                            </span>
                          </div>
                        )}

                        <button
                          type="button"
                          disabled={isQuickViewOutOfStock}
                          onClick={handleAddAllComboToCart}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            backgroundColor: isQuickViewOutOfStock ? '#CBD5E1' : 'var(--green-700)',
                            color: isQuickViewOutOfStock ? '#64748B' : '#FFFFFF',
                            border: 'none',
                            fontSize: '12px',
                            fontWeight: '800',
                            cursor: isQuickViewOutOfStock ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '5px',
                            boxShadow: isQuickViewOutOfStock ? 'none' : '0 1px 3px rgba(0,0,0,0.1)'
                          }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                          {isQuickViewOutOfStock ? 'Combo tạm khóa' : 'Thêm cả combo'}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Dưới cùng: Nút xem chi tiết đầy đủ */}
            <div style={{
              padding: '12px 24px',
              backgroundColor: '#FFFFFF',
              borderTop: '1px solid var(--line)',
              textAlign: 'center'
            }}>
              <Link
                href={`/products/${quickViewProduct.id}`}
                onClick={() => setQuickViewProduct(null)}
                style={{
                  fontSize: '13px',
                  color: 'var(--green-700)',
                  fontWeight: '700',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🔍</span> Xem trang chi tiết đầy đủ &amp; Bảng dinh dưỡng chuyên sâu →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div>
              <div className="logo">LÀNH</div>
              <p>Nền tảng nông sản hữu cơ minh bạch — kết nối trực tiếp nông trại Việt Nam đến bữa ăn của bạn.</p>
              <div className="cert-row">
                <span className="cert-pill">VietGAP</span>
                <span className="cert-pill">GlobalGAP</span>
                <span className="cert-pill">USDA Organic</span>
              </div>
            </div>
            <div>
              <h5>Liên hệ</h5>
              <ul>
                <li>1900 6868 (7:00–21:00)</li>
                <li>hello@lanh.vn</li>
                <li>92 Nguyễn Huệ, Q.1, TP.HCM</li>
              </ul>
            </div>
            <div>
              <h5>Chính sách</h5>
              <ul>
                <li>Vận chuyển &amp; giao nhận</li>
                <li>Đổi trả trong 24h</li>
                <li>Bảo mật thông tin</li>
                <li>Điều khoản dịch vụ</li>
              </ul>
            </div>
            <div>
              <h5>Thanh toán</h5>
              <div className="pay-icons">
                <span>VISA</span><span>MoMo</span><span>ZaloPay</span><span>COD</span>
              </div>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© 2026 LÀNH — Đồ án tốt nghiệp UI/UX, Đại học ABC.</span>
            <span>Thiết kế minh họa cho mục đích học thuật.</span>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <div className={`overlay ${isDrawerOpen ? 'show' : ''}`} onClick={() => setIsDrawerOpen(false)}></div>
      <aside className={`drawer ${isDrawerOpen ? 'show' : ''}`} aria-label="Giỏ hàng">
        <div className="drawer-head">
          <h3>Giỏ hàng của bạn</h3>
          <button className="icon-btn" onClick={() => setIsDrawerOpen(false)} aria-label="Đóng giỏ hàng">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>
        <div className="drawer-body">
          {cart.length === 0 ? (
            <div className="drawer-empty">Giỏ hàng đang trống.</div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="drawer-item">
                <div className="thumb">
                  {item.product.imageUrl ? (
                    <img src={item.product.imageUrl} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                  ) : (
                    ICONS[item.product.icon] || ICONS['leaf']
                  )}
                </div>
                <div className="info">
                  <b>{item.product.name}</b>
                  <span>{item.product.price} {item.product.unit}</span>
                  <div className="qty-ctrl" style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--line)', borderRadius: '6px', overflow: 'hidden' }}>
                    <button onClick={() => updateCartQty(item.product.id, -1)} style={{ userSelect: 'none' }} aria-label="Giảm 1">-</button>
                    <input
                      type="number"
                      min={1}
                      max={999}
                      step={1}
                      value={item.qty}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setCartItemQty(item.product.id, isNaN(val) ? 1 : Math.max(1, Math.min(999, val)));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          setCartItemQty(item.product.id, Math.min(999, item.qty + 1));
                        } else if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          setCartItemQty(item.product.id, Math.max(1, item.qty - 1));
                        }
                      }}
                      onBlur={() => {
                        if (!item.qty || item.qty < 1) setCartItemQty(item.product.id, 1);
                      }}
                      style={{
                        width: '36px',
                        height: '24px',
                        textAlign: 'center',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        color: 'var(--ink)',
                        border: 'none',
                        background: 'transparent',
                        outline: 'none',
                        padding: 0,
                        MozAppearance: 'textfield'
                      }}
                      title="Nhập số lượng hoặc dùng phím mũi tên Lên/Xuống trên bàn phím"
                      aria-label="Số lượng sản phẩm"
                    />
                    <button onClick={() => updateCartQty(item.product.id, 1)} style={{ userSelect: 'none' }} aria-label="Tăng 1">+</button>
                  </div>
                </div>
                <button className="remove-btn" onClick={() => removeFromCart(item.product.id)} aria-label="Xóa">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>
                </button>
              </div>
            ))
          )}
        </div>
        <div className="drawer-foot">
          <div className="row"><span>Tạm tính</span><span>{toVND(totalCart)}</span></div>
          <button 
            className="btn btn-accent" 
            onClick={handleGoToCheckout} 
          >
            Thanh toán ngay
          </button>
        </div>
      </aside>
    </>
  );
}

export default function AllProductsPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--ink-soft)', fontSize: '14px' }}>Đang tải danh sách nông sản...</p>
      </div>
    }>
      <AllProductsInner />
    </Suspense>
  );
}
