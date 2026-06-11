import React, { useState, useRef, useEffect } from 'react';
import { SalesByPeriodPoint } from '../types';
import { LineChart, Loader2, HelpCircle } from 'lucide-react';

interface SalesByMethodLineProps {
  data: SalesByPeriodPoint[] | null;
  loading: boolean;
}

export default function SalesByMethodLine({ data, loading }: SalesByMethodLineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 600, height: 220 });
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [trackerPos, setTrackerPos] = useState({ x: 0 });

  // Handle responsive resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({ 
          width: Math.max(width, 300), 
          height: Math.max(height, 180) 
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  if (loading || !data || data.length === 0) {
    return (
      <div className="glass-panel p-5 rounded-2xl w-full" id="methods-line-skeleton">
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-1.5">
            <div className="w-56 h-4 bg-slate-200/50 rounded-md animate-pulse" />
            <div className="w-44 h-3 bg-slate-200/50 rounded-md animate-pulse" />
          </div>
          <Loader2 size={16} className="animate-spin text-[#6225C6]" />
        </div>
        <div className="w-full h-44 bg-[#6225C6]/5 rounded-2xl flex items-center justify-center border border-slate-200/40">
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={24} className="animate-spin text-brand-blue" />
            <span className="text-xs text-slate-400 font-semibold font-mono animate-pulse">Agregando transações por canal...</span>
          </div>
        </div>
      </div>
    );
  }

  const width = containerSize.width;
  const height = containerSize.height;
  const paddingLeft = 45;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Max value among all methods to keep appropriate vertical proportion
  const maxVal = Math.max(...data.map(d => Math.max(d.pix, d.card, d.bankslip, d.other)), 500) * 1.15;
  const minVal = 0;

  const getCoords = (idx: number, val: number) => {
    const x = paddingLeft + (idx / (data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((val - minVal) / (maxVal - minVal)) * chartHeight;
    return { x, y };
  };

  // Build curved SVG lines for each of the 4 methods
  const buildLinePath = (method: 'pix' | 'card' | 'bankslip' | 'other') => {
    const points = data.map((d, i) => getCoords(i, d[method]));
    if (points.length < 2) return '';
    
    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 3;
      const cpY1 = p0.y;
      const cpX2 = p0.x + 2 * (p1.x - p0.x) / 3;
      const cpY2 = p1.y;
      path += ` C ${cpX1},${cpY1} ${cpX2},${cpY2} ${p1.x},${p1.y}`;
    }
    return path;
  };

  const linePaths = {
    pix: buildLinePath('pix'),
    card: buildLinePath('card'),
    bankslip: buildLinePath('bankslip'),
    other: buildLinePath('other')
  };

  // Handle Mouse Hovering
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - paddingLeft;
    
    const ratio = mouseX / chartWidth;
    let index = Math.round(ratio * (data.length - 1));
    index = Math.max(0, Math.min(data.length - 1, index));

    setHoverIndex(index);
    setTrackerPos({ x: getCoords(index, 0).x });
  };

  // Grid subdivisions
  const gridLinesCount = 4;
  const gridLines = Array.from({ length: gridLinesCount }, (_, i) => {
    const ratio = i / (gridLinesCount - 1);
    const value = maxVal - ratio * (maxVal - minVal);
    const yOffset = paddingTop + ratio * chartHeight;
    return { value, yOffset };
  });

  return (
    <div
      className="rounded-2xl glass-panel p-5 border border-slate-200/50 hover:border-slate-350 transition-all duration-300 flex flex-col justify-between"
      id="sales-by-method-line-widget"
    >
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <LineChart className="text-[#6225C6] shrink-0" size={18} />
          <div className="flex flex-col text-left">
            <h3 className="text-sm font-display font-bold text-slate-800 tracking-wide">
              Distribuição Linear por Meio de Pagamento
            </h3>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
              Comparativo das vendas diárias por Pix, Cartão de Crédito, Boleto e Outros canais.
            </p>
          </div>
        </div>
        <div className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer">
          <HelpCircle size={14} title="Este gráfico exibe o detalhamento por dia para cada modalidade transacionada." />
        </div>
      </div>

      {/* Series Labels Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-1 mb-3 px-1 text-[10px] font-sans font-bold">
        <span className="flex items-center gap-1.5 text-cyan-600">
          <span className="w-2.5 h-2.5 rounded bg-cyan-500 opacity-80" /> Pix Instantâneo
        </span>
        <span className="flex items-center gap-1.5 text-[#0F5FC2]">
          <span className="w-2.5 h-2.5 rounded bg-[#0F5FC2]" /> Cartão de Crédito
        </span>
        <span className="flex items-center gap-1.5 text-[#1B874B]">
          <span className="w-2.5 h-2.5 rounded bg-[#1B874B]" /> Boleto Bancário
        </span>
        <span className="flex items-center gap-1.5 text-[#6225C6]">
          <span className="w-2.5 h-2.5 rounded bg-[#6225C6]" /> Outros Meios
        </span>
      </div>

      {/* SVG Canvas Container */}
      <div ref={containerRef} className="relative w-full h-[220px] pr-1 select-none">
        <svg
          width="100%"
          height="100%"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
          className="overflow-visible"
        >
          <defs>
            {/* Multi-glow filters */}
            <filter id="multiGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines */}
          {gridLines.map((line, idx) => (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={line.yOffset}
                x2={width - paddingRight}
                y2={line.yOffset}
                stroke="rgba(15, 23, 42, 0.06)"
                strokeWidth={1}
              />
              <text
                x={paddingLeft - 8}
                y={line.yOffset + 3.5}
                textAnchor="end"
                className="fill-slate-500 font-semibold font-mono text-[9px]"
              >
                {line.value >= 1000 
                  ? `${(line.value / 1000).toFixed(1)}k` 
                  : Math.round(line.value)}
              </text>
            </g>
          ))}

          {/* Sub line paths */}
          {linePaths.pix && (
            <path d={linePaths.pix} fill="none" stroke="#06b6d4" strokeWidth={2} filter="url(#multiGlow)" strokeLinecap="round" strokeLinejoin="round" />
          )}
          {linePaths.card && (
            <path d={linePaths.card} fill="none" stroke="#0F5FC2" strokeWidth={2} filter="url(#multiGlow)" strokeLinecap="round" strokeLinejoin="round" />
          )}
          {linePaths.bankslip && (
            <path d={linePaths.bankslip} fill="none" stroke="#1B874B" strokeWidth={2} filter="url(#multiGlow)" strokeLinecap="round" strokeLinejoin="round" />
          )}
          {linePaths.other && (
            <path d={linePaths.other} fill="none" stroke="#6225C6" strokeWidth={2} filter="url(#multiGlow)" strokeLinecap="round" strokeLinejoin="round" />
          )}

          {/* Crosshair timeline markers */}
          {hoverIndex !== null && (
            <g>
              <line
                x1={trackerPos.x}
                y1={paddingTop}
                x2={trackerPos.x}
                y2={paddingTop + chartHeight}
                stroke="rgba(15, 23, 42, 0.08)"
                strokeDasharray="3,3"
                strokeWidth={1}
                className="pointer-events-none"
              />

              {/* Anchor points */}
              {['pix', 'card', 'bankslip', 'other'].map((method) => {
                const color = method === 'pix' ? '#06b6d4' : method === 'card' ? '#0F5FC2' : method === 'bankslip' ? '#1B874B' : '#6225C6';
                const val = data[hoverIndex][method as 'pix' | 'card' | 'bankslip' | 'other'];
                const coords = getCoords(hoverIndex, val);
                return (
                  <circle
                    key={method}
                    cx={coords.x}
                    cy={coords.y}
                    r={4}
                    fill={color}
                    stroke="rgba(255,255,255,0.95)"
                    strokeWidth={1.5}
                    style={{ filter: `drop-shadow(0 1px 1px rgba(15,23,42,0.15))` }}
                    className="pointer-events-none"
                  />
                );
              })}
            </g>
          )}

          {/* Horiz dates */}
          {data.map((point, idx) => {
            const divider = Math.max(1, Math.floor(data.length / 5));
            if (idx % divider !== 0 && idx !== data.length - 1) return null;

            const coords = getCoords(idx, 0);
            return (
              <text
                key={idx}
                x={coords.x}
                y={paddingTop + chartHeight + 16}
                textAnchor="middle"
                className="fill-slate-500 font-semibold font-mono text-[9px] transform-gpu translate-y-1"
              >
                {point.dateLabel}
              </text>
            );
          })}
        </svg>

        {/* Global summary card hovering */}
        {hoverIndex !== null && (
          <div
            className="absolute z-10 p-3 rounded-2xl backdrop-blur-md bg-white/95 border border-slate-200/60 shadow-xl pointer-events-none w-56 font-sans select-none"
            style={{
              left: Math.max(10, Math.min(width - 240, trackerPos.x - 110)),
              top: 15,
              transition: 'left 0.12s ease-out'
            }}
          >
            <span className="block text-[8px] font-mono text-slate-400 uppercase tracking-widest leading-none mb-2 font-bold">
              Detalhamento {data[hoverIndex].dateLabel} (2026)
            </span>
            <div className="space-y-1.5 text-[11px] leading-tight text-left">
              <div className="flex justify-between items-center text-cyan-600 font-mono font-bold">
                <span>Pix:</span>
                <span className="font-bold">{data[hoverIndex].pix.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              <div className="flex justify-between items-center text-[#0F5FC2] font-mono font-bold">
                <span>Cartão:</span>
                <span className="font-bold">{data[hoverIndex].card.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              <div className="flex justify-between items-center text-[#1B874B] font-mono font-bold">
                <span>Boleto:</span>
                <span className="font-bold">{data[hoverIndex].bankslip.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              <div className="flex justify-between items-center text-[#6225C6] font-mono font-bold">
                <span>Outros:</span>
                <span className="font-bold">{data[hoverIndex].other.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              <div className="flex justify-between items-center text-slate-800 font-mono border-t border-slate-200/60 pt-1.5 mt-1">
                <span className="font-bold text-[10px]">Faturamento Total:</span>
                <span className="font-bold text-xs text-[#B27B00]">
                  {data[hoverIndex].total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
