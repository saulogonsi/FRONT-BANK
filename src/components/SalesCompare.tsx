import React, { useState, useRef, useEffect } from 'react';
import { SalesByPeriodPoint } from '../types';
import { AreaChart, TrendingUp, HelpCircle } from 'lucide-react';

interface SalesCompareProps {
  data: SalesByPeriodPoint[] | null;
  loading: boolean;
}

export default function SalesCompare({ data, loading }: SalesCompareProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 600, height: 220 });
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Handle responsive ResizeObserver
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
      <div className="glass-panel p-5 rounded-2xl w-full" id="sales-compare-skeleton">
        <div className="flex justify-between mb-4">
          <div className="space-y-1.5">
            <div className="w-40 h-4 bg-slate-200/50 rounded-md animate-pulse" />
            <div className="w-56 h-3 bg-slate-200/50 rounded-md animate-pulse" />
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-200/50 animate-pulse" />
        </div>
        <div className="w-full h-44 bg-[#0F5FC2]/5 rounded-2xl flex items-center justify-center border border-slate-200/40">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full border-4 border-t-brand-blue border-slate-200/40 animate-spin" />
            <span className="text-xs text-slate-400 font-semibold font-mono animate-pulse">Consolidando série temporal...</span>
          </div>
        </div>
      </div>
    );
  }

  // Dimension helpers
  const width = containerSize.width;
  const height = containerSize.height;
  const paddingLeft = 45;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Min-Max values
  const volumes = data.map((d) => d.total);
  const maxVal = Math.max(...volumes, 1000) * 1.1; // 10% safety margin
  const minVal = 0;

  // Convert index/value to SVG Coordinate
  const getCoords = (idx: number, val: number) => {
    const x = paddingLeft + (idx / (data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((val - minVal) / (maxVal - minVal)) * chartHeight;
    return { x, y };
  };

  // Build Curved Path (Bezier Curve Spline)
  let pathStr = '';
  let areaStr = '';
  const points = data.map((d, i) => getCoords(i, d.total));

  if (points.length > 1) {
    // Start Path
    pathStr = `M ${points[0].x},${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      
      // Control points for a smooth cubic bezier spline
      const cpX1 = p0.x + (p1.x - p0.x) / 3;
      const cpY1 = p0.y;
      const cpX2 = p0.x + 2 * (p1.x - p0.x) / 3;
      const cpY2 = p1.y;
      
      pathStr += ` C ${cpX1},${cpY1} ${cpX2},${cpY2} ${p1.x},${p1.y}`;
    }

    // Build area fill path closing it at the bottom line
    areaStr = `${pathStr} L ${points[points.length - 1].x},${paddingTop + chartHeight} L ${points[0].x},${paddingTop + chartHeight} Z`;
  }

  // Handle Mouse Hovering
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - paddingLeft;
    
    // Find closest index matching mouse x position
    const ratio = mouseX / chartWidth;
    let closestIdx = Math.round(ratio * (data.length - 1));
    closestIdx = Math.max(0, Math.min(data.length - 1, closestIdx));

    setHoverIndex(closestIdx);

    // Position tooltip precisely near parent coordinate
    const targetPoint = getCoords(closestIdx, data[closestIdx].total);
    setTooltipPos({
      x: targetPoint.x,
      y: targetPoint.y
    });
  };

  // Generate grid divider markers (y-axis values)
  const gridLinesCount = 4;
  const gridLines = Array.from({ length: gridLinesCount }, (_, i) => {
    const ratio = i / (gridLinesCount - 1);
    const value = maxVal - ratio * (maxVal - minVal);
    const yOffset = paddingTop + ratio * chartHeight;
    return { value, yOffset };
  });

  return (
    <div
      className="rounded-2xl glass-panel p-5 border border-slate-200/50 hover:border-slate-300 transition-all duration-300 flex flex-col justify-between"
      id="sales-compare-widget"
    >
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <AreaChart className="text-brand-blue shrink-0" size={18} />
          <div className="flex flex-col text-left">
            <h3 className="text-sm font-display font-bold text-slate-800 tracking-wide leading-tight">
              Especulação e Vendas por Período
            </h3>
            <p className="text-[11px] text-slate-500 font-sans font-normal leading-tight mt-0.5">
              Reflete o faturamento total acumulado (R$) distribuído ao longo dos filtros atuais.
            </p>
          </div>
        </div>
        <div className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer">
          <HelpCircle size={14} title="Este gráfico exibe o volume de vendas histórico em Reais." />
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div ref={containerRef} className="relative w-full h-[220px] mt-1 pr-1 select-none">
        
        {/* SVG Drawing Canvas */}
        <svg
          width="100%"
          height="100%"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
          className="overflow-visible"
        >
          <defs>
            {/* Area Fill Gradient */}
            <linearGradient id="areaGlowGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0F5FC2" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0F5FC2" stopOpacity="0.01" />
            </linearGradient>

            {/* Glowing drop shadow filter for spline line */}
            <filter id="svgGlowFilter" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Horizontal Grid Lines */}
          {gridLines.map((line, idx) => (
            <g key={idx} className="opacity-100">
              <line
                x1={paddingLeft}
                y1={line.yOffset}
                x2={width - paddingRight}
                y2={line.yOffset}
                stroke="rgba(15, 23, 42, 0.06)"
                strokeDasharray="4,4"
                strokeWidth={1}
              />
              {/* Y Axis Labels */}
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

          {/* Glowing Area Fill */}
          {areaStr && (
            <path
              d={areaStr}
              fill="url(#areaGlowGrad)"
              className="pointer-events-none"
            />
          )}

          {/* Line Spline Path */}
          {pathStr && (
            <path
              d={pathStr}
              fill="none"
              stroke="#0F5FC2"
              strokeWidth={2.5}
              className="pointer-events-none"
              filter="url(#svgGlowFilter)"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Interactive Hover Guides & Circles */}
          {hoverIndex !== null && (
            <g>
              {/* Vertical Laser line on cursor */}
              <line
                x1={tooltipPos.x}
                y1={paddingTop}
                x2={tooltipPos.x}
                y2={paddingTop + chartHeight}
                stroke="rgba(15, 95, 194, 0.2)"
                strokeWidth={1}
                strokeDasharray="2,2"
                className="pointer-events-none"
              />
              
              {/* Floating Circle anchor */}
              <circle
                cx={tooltipPos.x}
                cy={tooltipPos.y}
                r={6}
                fill="#0F5FC2"
                stroke="rgba(255, 255, 255, 0.95)"
                strokeWidth={2}
                className="pointer-events-none"
                style={{ filter: 'drop-shadow(0 0 4px rgba(15, 95, 194, 0.5))' }}
              />
              <circle
                cx={tooltipPos.x}
                cy={tooltipPos.y}
                r={12}
                fill="none"
                stroke="rgba(15, 95, 194, 0.2)"
                strokeWidth={1.5}
                className="pointer-events-none animate-ping"
              />
            </g>
          )}

          {/* X Axis Timeline Labels */}
          {data.map((point, idx) => {
            // Render only a subset of dates to keep labels legible
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

        {/* Custom Float Glassmorphic Tooltip */}
        {hoverIndex !== null && (
          <div
            className="absolute z-10 p-2.5 rounded-xl backdrop-blur-md bg-white/95 border border-slate-200/60 shadow-xl pointer-events-none max-w-44 select-none"
            style={{
              left: Math.max(10, Math.min(width - 150, tooltipPos.x - 70)),
              top: Math.max(5, tooltipPos.y - 70),
              transition: 'left 0.15s ease-out, top 0.15s ease-out'
            }}
          >
            <span className="block text-[8px] font-mono text-slate-400 uppercase tracking-widest leading-none mb-1 font-semibold">
              {data[hoverIndex].dateLabel} (2026)
            </span>
            <div className="flex flex-col text-left">
              <span className="text-[11px] font-sans font-bold text-slate-900 leading-none">
                Volume Total
              </span>
              <span className="text-xs font-mono font-bold text-[#0F5FC2] mt-0.5 leading-none">
                {data[hoverIndex].total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
