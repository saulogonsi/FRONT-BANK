import { useState, useEffect } from 'react';
import { Wallet, Receipt, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { DashboardOverview } from '../types';

interface TotalCardsProps {
  data: DashboardOverview | null;
  loading: boolean;
}

// Simple internal animated counter to avoid external dependencies
function AnimatedValue({ value, isCurrency = false }: { value: number; isCurrency?: boolean }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) {
      setCurrent(0);
      return;
    }
    const duration = 1200; // ms
    const increment = end / (duration / 16); // 60fps frame rate
    
    let timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCurrent(end);
        clearInterval(timer);
      } else {
        setCurrent(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  if (isCurrency) {
    return (
      <span className="font-display text-lg sm:text-2xl font-bold tracking-tight text-slate-900 font-mono break-all leading-tight">
        {current.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    );
  }

  return (
    <span className="font-display text-lg sm:text-2xl font-bold tracking-tight text-slate-900 font-mono leading-tight">
      {Math.round(current).toLocaleString('pt-BR')}
    </span>
  );
}

export default function TotalCards({ data, loading }: TotalCardsProps) {
  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="total-cards-skeleton">
        {[1, 2, 3].map((idx) => (
          <div key={idx} className="glass-panel p-5 rounded-2xl animate-pulse space-y-4 h-32 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div className="w-24 h-4 bg-slate-200/50 rounded-md" />
              <div className="w-8 h-8 bg-slate-200/50 rounded-full" />
            </div>
            <div className="w-40 h-8 bg-slate-200/50 rounded-md" />
            <div className="w-28 h-3 bg-slate-200/50 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  const { volume, count, average } = data;

  const cardConfig = [
    {
      title: 'TOTAL EM VENDAS',
      metric: volume,
      icon: Wallet,
      color: 'bg-[#B27B00]/10 text-[#B27B00] shadow-[0_4px_15px_rgba(178,123,0,0.1)]',
      isCurrency: true,
      sparklineColor: '#sub-yellow'
    },
    {
      title: 'TOTAL DE VENDAS',
      metric: count,
      icon: Receipt,
      color: 'bg-[#6225C6]/10 text-[#6225C6] shadow-[0_4px_15px_rgba(98,37,198,0.1)]',
      isCurrency: false,
      sparklineColor: '#sub-purple'
    },
    {
      title: 'TICKET MÉDIO',
      metric: average,
      icon: TrendingUp,
      color: 'bg-[#1B874B]/10 text-[#1B874B] shadow-[0_4px_15px_rgba(27,135,75,0.1)]',
      isCurrency: true,
      sparklineColor: '#sub-green'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="total-cards-grid">
      {cardConfig.map((card, idx) => {
        const Icon = card.icon;
        const trendPos = card.metric.isPositive;
        const percentString = card.metric.percent.toLocaleString('pt-BR') + '%';
        const sparkMax = Math.max(...card.metric.sparklineData, 1);
        const sparkMin = Math.min(...card.metric.sparklineData, 0);
        const sparkPoints = card.metric.sparklineData.map((val, i) => {
          const x = (i / (card.metric.sparklineData.length - 1)) * 90 + 5;
          const y = 25 - ((val - sparkMin) / (sparkMax - sparkMin || 1)) * 18;
          return `${x},${y}`;
        }).join(' ');

        return (
          <div
            key={idx}
            className="group relative rounded-2xl glass-panel p-5 overflow-hidden flex flex-col justify-between h-36 border border-slate-200/50 hover:border-slate-300 transition-all duration-300 transform hover:scale-[1.015]"
            id={`total-card-${idx}`}
          >
            {/* Ambient Background Radial Glow on hover */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-100/50 to-transparent rounded-bl-full pointer-events-none group-hover:bg-slate-100/70 transition-colors duration-300" />

            {/* Header row */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-sans font-bold tracking-wider text-slate-500 uppercase">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl shrink-0 ${card.color} transition-all duration-300 group-hover:scale-110`}>
                <Icon size={16} />
              </div>
            </div>

            {/* Main Numeric Counter */}
            <div className="mt-2.5">
              <AnimatedValue value={card.metric.value} isCurrency={card.isCurrency} />
            </div>

            {/* Footer row featuring elegant miniature sparkline */}
            <div className="mt-2 flex items-center justify-between text-[11px] gap-2">
              <div className="flex items-center gap-1 shrink-0 font-medium font-sans">
                {trendPos ? (
                  <span className="flex items-center text-[#1B874B] bg-[#1B874B]/10 px-1.5 py-0.5 rounded-full font-mono font-bold gap-0.5 animate-pulse">
                    <ArrowUpRight size={12} strokeWidth={2.5} />
                    {percentString}
                  </span>
                ) : (
                  <span className="flex items-center text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full font-mono font-bold gap-0.5">
                    <ArrowDownRight size={12} strokeWidth={2.5} />
                    {percentString}
                  </span>
                )}
                <span className="text-slate-400 text-[10px] font-semibold">vs anterior</span>
              </div>

              {/* Glowing mini SVG Sparkline */}
              <div className="w-16 h-6 opacity-60 group-hover:opacity-100 transition-opacity flex items-end">
                <svg className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id={`sparkGrad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={trendPos ? '#1B874B' : '#EF4444'} stopOpacity="0.4" />
                      <stop offset="100%" stopColor={trendPos ? '#1B874B' : '#EF4444'} stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Fill Area */}
                  <path
                    d={`M5,25 L${sparkPoints} L95,25 Z`}
                    fill={`url(#sparkGrad-${idx})`}
                    stroke="none"
                  />
                  
                  {/* Stroke Line */}
                  <polyline
                    fill="none"
                    stroke={trendPos ? '#1B874B' : '#EF4444'}
                    strokeWidth="1.5"
                    points={sparkPoints}
                    className="stroke-linecap-round stroke-linejoin-round"
                    strokeDasharray="100"
                    strokeDashoffset="100"
                    style={{ animation: 'sparkDraw 1.5s forwards ease-in-out' }}
                  />
                </svg>
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Styles for dynamic line drawing animation */}
      <style>{`
        @keyframes sparkDraw {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}
