import React, { useState, useEffect, useRef } from 'react';
import { Users, Search, Check, X, ChevronDown, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Seller } from '../types';
import { MOCK_SELLERS } from '../data/mockData';

interface SellerSelectProps {
  selectedIds: string[] | null;
  onChange: (ids: string[] | null) => void;
}

export default function SellerSelect({ selectedIds, onChange }: SellerSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [visibleSellers, setVisibleSellers] = useState<Seller[]>(MOCK_SELLERS);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter sellers on search with debounce simulation
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const filtered = MOCK_SELLERS.filter(seller => 
        seller.name.toLowerCase().includes(search.toLowerCase()) ||
        seller.email.toLowerCase().includes(search.toLowerCase())
      );
      // Take first 5 for initial search view to simulate pagination loading
      setVisibleSellers(filtered.slice(0, 5));
      setPage(1);
      setHasMore(filtered.length > 5);
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  // Handle mock infinite scroll
  const handleScroll = () => {
    if (!listRef.current || isLoadingMore || !hasMore) return;
    
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    // 40px from bottom detection
    if (scrollHeight - scrollTop - clientHeight < 40) {
      setIsLoadingMore(true);
      
      setTimeout(() => {
        const filtered = MOCK_SELLERS.filter(seller => 
          seller.name.toLowerCase().includes(search.toLowerCase()) ||
          seller.email.toLowerCase().includes(search.toLowerCase())
        );
        
        const nextPage = page + 1;
        const nextBatch = filtered.slice(0, nextPage * 5);
        
        setVisibleSellers(nextBatch);
        setPage(nextPage);
        setHasMore(nextBatch.length < filtered.length);
        setIsLoadingMore(false);
      }, 500); // Simulate network latency
    }
  };

  const handleToggle = (id: string) => {
    const current = selectedIds ? [...selectedIds] : [];
    const index = current.indexOf(id);
    
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(id);
    }
    
    onChange(current.length > 0 ? current : null);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setSearch('');
  };

  // Determine button label based on selection
  let buttonLabel = 'Todos os Sellers';
  if (selectedIds && selectedIds.length > 0) {
    const firstSeller = MOCK_SELLERS.find(s => s.id === selectedIds[0]);
    if (firstSeller) {
      buttonLabel = selectedIds.length === 1 
        ? firstSeller.name 
        : `${firstSeller.name} (+${selectedIds.length - 1})`;
    }
  }

  return (
    <div className="relative w-full md:w-72" ref={dropdownRef} id="seller-select-container">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl glass-panel text-slate-800 hover:bg-white/80 transition-all duration-200 cursor-pointer active:scale-[0.98]"
        id="seller-select-trigger"
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <Users size={18} className="text-brand-blue shrink-0 animate-pulse" />
          <span className="text-sm font-sans tracking-wide truncate max-w-44 text-left font-semibold">
            {buttonLabel}
          </span>
        </div>
        
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {selectedIds && selectedIds.length > 0 && (
            <div 
              onClick={handleClear}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
              title="Limpar seleção"
            >
              <X size={14} />
            </div>
          )}
          <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute left-0 right-0 z-50 rounded-2xl glass-panel p-3 shadow-2xl mt-1 overflow-hidden"
            id="seller-select-dropdown"
          >
            {/* Search Input */}
            <div className="relative mb-2">
              <Search size={14} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Pesquisar seller..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl glass-input placeholder-slate-400 text-slate-800 font-sans transition-all"
                id="seller-search-input"
              />
              {search && (
                <button 
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Selection quick actions */}
            <div className="flex items-center justify-between px-1 py-1.5 border-b border-slate-200/50 mb-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Sellers ({visibleSellers.length} mostrados)
              </span>
              {selectedIds && selectedIds.length > 0 && (
                <button
                  onClick={() => onChange(null)}
                  className="text-[10px] text-brand-yellow font-sans font-medium hover:underline cursor-pointer"
                >
                  Limpar todos
                </button>
              )}
            </div>

            {/* List */}
            <div
              ref={listRef}
              onScroll={handleScroll}
              className="max-h-60 overflow-y-auto space-y-1 pr-1"
              id="seller-scroll-list"
            >
              {visibleSellers.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 font-sans">
                  Nenhum seller encontrado
                </div>
              ) : (
                visibleSellers.map((seller) => {
                  const isChecked = selectedIds?.includes(seller.id) || false;
                  return (
                    <div
                      key={seller.id}
                      onClick={() => handleToggle(seller.id)}
                      className={`flex items-center justify-between px-2.5 py-2 rounded-xl transition-all duration-150 cursor-pointer text-left ${
                        isChecked 
                          ? 'bg-brand-blue/15 text-brand-blue' 
                          : 'hover:bg-slate-100/80 text-slate-700 hover:text-slate-900'
                      }`}
                      id={`seller-item-${seller.id}`}
                    >
                      <div className="flex flex-col overflow-hidden mr-2">
                        <span className="text-xs font-sans font-bold tracking-wide truncate">
                          {seller.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 truncate">
                          {seller.email}
                        </span>
                      </div>
                      
                      {/* Custom Glass Checkbox */}
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        isChecked 
                          ? 'border-brand-blue bg-brand-blue text-white' 
                          : 'border-slate-300 bg-white/75'
                      }`}>
                        {isChecked && <Check size={10} strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })
              )}

              {/* Infinite Scroll Loader */}
              {isLoadingMore && (
                <div className="flex items-center justify-center py-2 gap-1 text-slate-400 text-[10px] font-sans">
                  <Loader2 size={12} className="animate-spin text-brand-blue" />
                  <span>Buscando mais...</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
