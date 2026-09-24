'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

type SuggestionItem = {
  productId: number;
  productName: string;
  price: number;
  unit: string;
  imageUrl?: string;
};

interface SearchBarProps {
  placeholder?: string;
  initialValue?: string;
  onSearchSubmit?: (query: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function SearchBar({
  placeholder = "Bạn muốn tìm nông sản gì hôm nay? (Rau cải, bơ sáp, dâu tây...)",
  initialValue = "",
  onSearchSubmit,
  className = "search-shell",
  style
}: SearchBarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cập nhật khi initialValue từ bên ngoài thay đổi (ví dụ khi URL thay đổi)
  useEffect(() => {
    setSearchQuery(initialValue || "");
  }, [initialValue]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (val.trim().length > 0) {
      fetch(`http://localhost:5023/api/products/autocomplete?prefix=${encodeURIComponent(val.trim())}`)
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

  const executeSearch = (val?: string) => {
    const term = (val !== undefined ? val : searchQuery).trim();
    setShowSuggestions(false);
    if (onSearchSubmit) {
      onSearchSubmit(term);
    } else {
      if (term) {
        router.push(`/products?search=${encodeURIComponent(term)}`);
      } else {
        router.push('/products');
      }
    }
  };

  return (
    <div 
      className={className} 
      ref={containerRef} 
      style={{ position: 'relative', ...style }}
    >
      <input 
        type="text" 
        value={searchQuery}
        onChange={(e) => handleSearchChange(e.target.value)}
        onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            executeSearch();
          }
        }}
      />
      <button 
        type="button" 
        className="go" 
        onClick={() => executeSearch()} 
        aria-label="Tìm kiếm"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
          <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
        </svg>
        <span>Tìm</span>
      </button>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="suggestions-list" style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          right: 0,
          backgroundColor: 'var(--surface, #ffffff)',
          border: '1px solid var(--line, #e1eae0)',
          borderRadius: '10px',
          listStyle: 'none',
          padding: '6px 0',
          margin: 0,
          zIndex: 9999,
          boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
          textAlign: 'left'
        }}>
          <li style={{ padding: '6px 14px', fontSize: '11.5px', color: 'var(--ink-soft)', fontWeight: '700', textTransform: 'uppercase' }}>
            Gợi ý sản phẩm phù hợp
          </li>
          {suggestions.map((s, idx) => (
            <li 
              key={idx} 
              onClick={() => {
                setShowSuggestions(false);
                router.push(`/products/${s.productId}`);
              }}
              style={{
                padding: '10px 14px',
                cursor: 'pointer',
                borderBottom: idx < suggestions.length - 1 ? '1px solid var(--line)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'background .15s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--green-100)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              onMouseDown={(e) => e.preventDefault()}
            >
              <img 
                src={s.imageUrl || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=100&auto=format&fit=crop&q=80'} 
                alt={s.productName} 
                style={{ width: '38px', height: '38px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--line)' }} 
              />
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <strong style={{ fontSize: '13.5px', color: 'var(--ink)' }}>{s.productName}</strong>
                <span style={{ fontSize: '12px', color: '#e53e3e', fontWeight: '700' }}>
                  {s.price.toLocaleString('vi-VN')} đ<span style={{ color: 'var(--ink-soft)', fontWeight: 'normal', fontSize: '11px' }}> / {s.unit}</span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
export default SearchBar;
