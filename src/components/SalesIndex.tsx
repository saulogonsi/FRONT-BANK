import { Info, HelpCircle, Flame, CreditCard, Barcode, CheckCircle, XCircle } from 'lucide-react';
import { IndexData } from '../types';

interface SalesIndexProps {
  data: IndexData | null;
  loading: boolean;
}

// Custom Micro Ring Chart (DonutSmall equivalent using high-end SVG)
function MicroRing({ percent, color, glowColor }: { percent: number; color: string; glowColor: string }) {
  // SVG circular properties
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="24"
          cy="24"
          r={radius}
          className="stroke-slate-200/60 fill-none"
          strokeWidth="3.5"
        />
        <circle
          cx="24"
          cy="24"
          r={radius}
          className="fill-none stroke-linecap-round"
          stroke={color}
          strokeWidth="3.5"
          strokeDasharray={circumference}
          strokeDashoffset={targetOffset}
          style={{
            animation: 'ringDraw 1s cubic-bezier(0.4, 0, 0.2, 1) forwards',
            filter: `drop-shadow(0 1px 2px rgba(15, 23, 42, 0.08))`
          }}
        />
      </svg>
      {/* Centered label */}
      <span className="absolute text-[10px] font-mono font-bold text-slate-800">
        {Math.round(percent)}%
      </span>
    </div>
  );
}

export default function SalesIndex({ data, loading }: SalesIndexProps) {
  if (loading || !data) {
    return (
      <div className="glass-panel p-5 rounded-2xl w-full" id="sales-index-skeleton">
        <div className="w-36 h-4 bg-slate-200/50 rounded-md animate-pulse mb-6" />
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-200/50 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="w-24 h-3 bg-slate-200/50 rounded-md animate-pulse" />
              <div className="w-44 h-2 bg-slate-200/50 rounded-md animate-pulse" />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-200/50 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="w-24 h-3 bg-slate-200/50 rounded-md animate-pulse" />
              <div className="w-44 h-2 bg-slate-200/50 rounded-md animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { creditCard, pix, bankslip } = data;

  return (
    <div
      className="rounded-2xl glass-panel p-5 border border-slate-200/50 hover:border-slate-350 transition-all duration-300 space-y-5"
      id="sales-index-widget"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60">
        <div className="flex items-center gap-2">
          <Info size={16} className="text-[#B27B00] shrink-0" />
          <h3 className="text-xs font-display font-black text-slate-800 uppercase tracking-wider">
            Índices de Conversão e Parcelamento
          </h3>
        </div>
        <HelpCircle size={14} className="text-slate-400 hover:text-slate-700 cursor-help" title="Fatores de conversão e parcelas de cartões" />
      </div>

      {/* SECTION 1 - Conversão de Instantâneos & Boletos */}
      <div className="space-y-4 text-left" id="section-conversions">
        <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
          Conversão de Pagamentos (Aprovadas vs Total)
        </span>

        {/* PIX Donut card */}
        <div className="flex items-center gap-3.5 p-2.5 rounded-xl bg-cyan-500/5 border border-cyan-200/30 hover:border-cyan-300 transition-colors">
          <MicroRing percent={pix.rate} color="#06b6d4" glowColor="rgba(6,182,212,0.2)" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <Flame size={12} className="text-cyan-600 shrink-0" />
              <span className="text-xs font-sans font-bold text-slate-800 truncate">Conversão PIX</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 font-semibold mt-1">
              <span className="flex items-center gap-0.5"><CheckCircle size={10} className="text-[#1B874B]" /> {pix.paidCount} pagas</span>
              <span className="flex items-center gap-0.5"><XCircle size={10} className="text-red-500" /> {pix.unpaidCount} expiradas</span>
            </div>
          </div>
        </div>

        {/* Boleto Donut card */}
        <div className="flex items-center gap-3.5 p-2.5 rounded-xl bg-[#1B874B]/5 border border-[#1B874B]/15 hover:border-[#1B874B]/30 transition-colors">
          <MicroRing percent={bankslip.rate} color="#1B874B" glowColor="rgba(27,135,75,0.2)" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <Barcode size={12} className="text-[#1B874B] shrink-0" />
              <span className="text-xs font-sans font-bold text-slate-800 truncate">Conversão Boleto</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 font-semibold mt-1">
              <span className="flex items-center gap-0.5"><CheckCircle size={10} className="text-[#1B874B]" /> {bankslip.paidCount} pagos</span>
              <span className="flex items-center gap-0.5"><XCircle size={10} className="text-red-500" /> {bankslip.unpaidCount} vencidos</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2 - Cartão de Crédito e Parcelamento */}
      <div className="space-y-3 pt-2 text-left border-t border-slate-200/60" id="section-card-split">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
            Fatiamento de Cartões ({creditCard.totalCount} txs)
          </span>
          <div className="flex items-center gap-1 bg-[#0F5FC2]/10 text-[#0F5FC2] px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">
            <CreditCard size={10} />
            <span>Crédito</span>
          </div>
        </div>

        {/* Double segmented breakdown details */}
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/50 flex flex-col justify-between">
            <span className="text-[9px] font-sans text-slate-500 font-semibold">À vista (1x)</span>
            <span className="text-sm font-mono font-black text-slate-800 mt-0.5">{creditCard.cash}</span>
            <span className="text-[9px] font-sans font-bold text-[#0F5FC2] mt-0.5">
              {creditCard.totalCount > 0 ? Math.round((creditCard.cash / creditCard.totalCount) * 100) : 0}% do total
            </span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/50 flex flex-col justify-between">
            <span className="text-[9px] font-sans text-slate-500 font-semibold">Parceladas (2x+)</span>
            <span className="text-sm font-mono font-black text-slate-800 mt-0.5">{creditCard.installments}</span>
            <span className="text-[9px] font-sans font-bold text-[#6225C6] mt-0.5">
              {creditCard.totalCount > 0 ? Math.round((creditCard.installments / creditCard.totalCount) * 100) : 0}% do total
            </span>
          </div>
        </div>

        {/* Breakdown table list of actual installments */}
        <div className="space-y-1.5 pt-1.5" id="installments-breakdown-table">
          {creditCard.breakdown.map((row, idx) => (
            <div key={idx} className="flex items-center justify-between gap-3 text-[10px] font-sans">
              <span className="w-14 text-slate-600 font-bold">{row.installment}</span>
              
              {/* Mid fill bar */}
              <div className="flex-1 h-1.5 bg-slate-200/50 rounded-full relative overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-blue to-brand-purple"
                  style={{ width: `${row.percentage}%`, transition: 'width 1s ease-out' }}
                />
              </div>

              <div className="w-14 text-right flex items-center justify-end font-mono gap-1 text-slate-400 font-bold">
                <span className="text-slate-800 font-black">{row.count}</span>
                <span className="text-[8px]">({row.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes ringDraw {
          to { stroke-dashoffset: var(--targetOffset); }
        }
      `}</style>
    </div>
  );
}
