import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface FilterDateRangeProps {
  startDate: string | null; // ISO Date String
  endDate: string | null;   // ISO Date String
  lang: string;
  onChange: (start: string | null, end: string | null, label: string) => void;
}

export default function FilterDateRange({ startDate, endDate, lang, onChange }: FilterDateRangeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Local calendar navigation month
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 5, 1)); // June 2026 reflecting the 2026 date context
  
  // Track selection state
  const [tempStart, setTempStart] = useState<Date | null>(startDate ? new Date(startDate) : null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  // Synchronize initial state
  useEffect(() => {
    setTempStart(startDate ? new Date(startDate) : null);
  }, [startDate, isOpen]);

  // Click outside handling
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDateLabel = (startStr: string | null, endStr: string | null): string => {
    if (!startStr || !endStr) return 'Selecionar Período';
    
    // Check if it matches quick-ranges
    if (lang === 'last24h') return 'Últimas 24h';
    if (lang === 'last7d') return 'Últimos 7 dias';
    if (lang === 'last30d') return 'Últimos 30 dias';
    
    const start = new Date(startStr);
    const end = new Date(endStr);
    
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(start.getDate())}/${pad(start.getMonth() + 1)}/${start.getFullYear()} ➔ ${pad(end.getDate())}/${pad(end.getMonth() + 1)}/${end.getFullYear()}`;
  };

  const handleDayClick = (dayDate: Date) => {
    if (!tempStart) {
      // First click: set start date
      setTempStart(dayDate);
    } else {
      // Second click: handle range and selection
      let first = new Date(tempStart);
      let second = new Date(dayDate);
      
      // Auto inverse if second is before first
      if (second < first) {
        const temp = first;
        first = second;
        second = temp;
      }
      
      // Set end time to end of day to include full values
      first.setHours(0, 0, 0, 0);
      second.setHours(23, 59, 59, 999);
      
      onChange(first.toISOString(), second.toISOString(), 'custom');
      setTempStart(null);
      setIsOpen(false);
    }
  };

  const handleQuickSelect = (preset: string) => {
    const end = new Date(2026, 5, 10, 23, 59, 59, 999); // Fixed contextual date matching screenshots (10 June 2026)
    const start = new Date(end);

    if (preset === 'last24h') {
      start.setDate(end.getDate() - 1);
      onChange(start.toISOString(), end.toISOString(), 'last24h');
    } else if (preset === 'last7d') {
      start.setDate(end.getDate() - 7);
      onChange(start.toISOString(), end.toISOString(), 'last7d');
    } else if (preset === 'last30d') {
      start.setDate(end.getDate() - 30);
      onChange(start.toISOString(), end.toISOString(), 'last30d');
    } else if (preset === 'currentMonth') {
      const monthStart = new Date(2026, 5, 1, 0, 0, 0, 0);
      onChange(monthStart.toISOString(), end.toISOString(), 'currentMonth');
    }
    setTempStart(null);
    setIsOpen(false);
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    const end = new Date(2026, 5, 10, 23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(end.getDate() - 1); // fallback to last 24h
    onChange(start.toISOString(), end.toISOString(), 'last24h');
    setTempStart(null);
  };

  const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const changeMonth = (val: number) => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + val);
    setCurrentMonth(nextMonth);
  };

  const monthDays = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  const monthName = currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  // Render day slots including blank cells for offset
  const firstDayIndex = (new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() + 6) % 7; // monday-indexed
  const blankCells = Array(firstDayIndex).fill(null);

  const isSelected = (dayDate: Date) => {
    if (!tempStart && startDate && endDate) {
      const s = new Date(startDate);
      const e = new Date(endDate);
      return dayDate >= s && dayDate <= e;
    }
    if (tempStart && !hoverDate) {
      return dayDate.getTime() === tempStart.getTime();
    }
    if (tempStart && hoverDate) {
      let first = new Date(tempStart);
      let second = new Date(hoverDate);
      if (second < first) {
        const temp = first;
        first = second;
        second = temp;
      }
      return dayDate >= first && dayDate <= second;
    }
    return false;
  };

  const isLimit = (dayDate: Date) => {
    if (tempStart) {
      return dayDate.getTime() === tempStart.getTime();
    }
    if (startDate && endDate) {
      const s = new Date(startDate);
      const e = new Date(endDate);
      
      // Compare calendar dates accurately
      const compareCalendarDate = (d1: Date, d2: Date) => 
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

      return compareCalendarDate(dayDate, s) || compareCalendarDate(dayDate, e);
    }
    return false;
  };

  return (
    <div className="relative w-full md:w-auto" ref={dropdownRef} id="date-range-container">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl glass-panel text-slate-800 hover:bg-white/80 transition-all duration-200 cursor-pointer active:scale-[0.98]"
        id="date-range-trigger"
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <CalendarIcon size={18} className="text-brand-purple shrink-0 animate-pulse" />
          <span className="text-xs font-sans tracking-wide truncate font-semibold text-left">
            {formatDateLabel(startDate, endDate)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {lang !== 'last24h' && (
            <div 
              onClick={clearSelection}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
              title="Limpar período"
            >
              <X size={14} />
            </div>
          )}
          <ChevronRight size={16} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
        </div>
      </button>

      {/* Dropdown Calendar Portal container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 4 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 z-50 rounded-2xl glass-panel p-4 shadow-2xl mt-1 overflow-hidden flex flex-col md:flex-row gap-4 w-[295px] md:w-[480px]"
            id="date-picker-dropdown"
          >
            {/* Quick selectors Sidebar */}
            <div className="w-full md:w-36 flex md:flex-col gap-1.5 border-b md:border-b-0 md:border-r border-slate-200/50 pb-3 md:pb-0 md:pr-3 shrink-0">
              <span className="hidden md:block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">
                Atalhos
              </span>
              {['last24h', 'last7d', 'last30d', 'currentMonth'].map((p) => {
                const label = p === 'last24h' ? 'Últimas 24h' : p === 'last7d' ? 'Últimos 7 dias' : p === 'last30d' ? 'Últimos 30 dias' : 'Mês Atual';
                const isPresetActive = lang === p;
                return (
                  <button
                    key={p}
                    onClick={() => handleQuickSelect(p)}
                    className={`flex-1 md:w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-sans transition-all cursor-pointer ${
                      isPresetActive 
                        ? 'bg-brand-purple/15 text-brand-purple border border-brand-purple/25 font-semibold' 
                        : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100/60 hover:translate-x-0.5'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Calendar Core Block */}
            <div className="flex-1">
              {/* Calendar Header Nav */}
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-display font-black tracking-wide text-slate-800 capitalize">
                  {monthName}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => changeMonth(-1)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => changeMonth(1)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 transition-colors cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Day Headers (Mon-Sun) */}
              <div className="grid grid-cols-7 text-center text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-semibold">
                {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((day, idx) => (
                  <span key={idx} className="h-6 flex items-center justify-center">
                    {day}
                  </span>
                ))}
              </div>

              {/* Day Grid */}
              <div className="grid grid-cols-7 text-center gap-y-0.5" id="calendar-days-grid">
                {blankCells.map((_, idx) => (
                  <div key={`blank-${idx}`} className="h-7" />
                ))}

                {monthDays.map((dayDate, idx) => {
                  const dayNum = dayDate.getDate();
                  const selected = isSelected(dayDate);
                  const limit = isLimit(dayDate);
                  
                  return (
                    <div
                      key={`day-${idx}`}
                      onClick={() => handleDayClick(dayDate)}
                      onMouseEnter={() => tempStart && setHoverDate(dayDate)}
                      onMouseLeave={() => tempStart && setHoverDate(null)}
                      className={`h-7 flex items-center justify-center relative cursor-pointer text-xs font-mono transition-all duration-100 ${
                        selected 
                          ? 'bg-slate-200/50 text-slate-900 font-semibold' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 hover:rounded-lg'
                      } ${limit ? 'z-10 rounded-lg bg-gradient-to-r from-brand-purple to-brand-blue text-white font-bold' : ''}`}
                    >
                      <span className="relative z-10">{dayNum}</span>
                      
                      {/* Sub-level neon bar for selected days */}
                      {selected && !limit && (
                        <div className="absolute inset-0 bg-brand-purple/10 rounded-md pointer-events-none" />
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Temp selection feedback */}
              {tempStart && (
                <div className="flex items-center justify-center gap-1.5 mt-2.5 text-[10px] font-sans text-brand-purple font-semibold">
                  <span>Início definido</span>
                  <ArrowRight size={10} />
                  <span>Selecione a data de término</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
