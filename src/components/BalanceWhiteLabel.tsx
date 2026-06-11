import { useState } from 'react';
import { HelpCircle, Info, Landmark, Percent, Settings, ShieldAlert, TrendingUp } from 'lucide-react';
import { WhiteLabelBalanceData } from '../types';

interface BalanceWhiteLabelProps {
  data: WhiteLabelBalanceData | null;
  loading: boolean;
  dateStartLabel: string;
  dateEndLabel: string;
}

export default function BalanceWhiteLabel({ data, loading, dateStartLabel, dateEndLabel }: BalanceWhiteLabelProps) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Helper formats
  const formatDateTiny = (isoString: string | null): string => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  if (loading || !data) {
    return (
      <div className="glass-panel p-5 rounded-2xl w-full" id="white-label-balance-skeleton">
        <div className="w-40 h-4 bg-slate-200/50 rounded-md animate-pulse mb-6" />
        <div className="space-y-5">
          {[1, 2, 3, 4, 5].map((idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between">
                <div className="w-24 h-3 bg-slate-200/50 rounded-md animate-pulse" />
                <div className="w-20 h-3 bg-slate-200/50 rounded-md animate-pulse" />
              </div>
              <div className="w-full h-[1px] bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Tooltips content
  const tooltips: Record<string, string> = {
    adqFaturamento: "Volume financeiro total que transitou pela adquirencial correspondente à receita bruta das bandeiras integradas.",
    adqTaxas: "Tarifas e taxas de intermediação retidas pelas bandeiras e liquidador por serviços de processamento de cartões.",
    adqEstornos: "Montante de contestações (chargebacks) ocorridas no período de compensação.",
    antecipacoes: "Receita gerada pela modalidade de recebimento antecipado aplicada aos sellers.",
    tecnologia: "Taxa de infraestrutura de nuvem, segurança e mensageria cobrada pela plataforma principal.",
    lucro: "Lucratividade líquida resultante da operação White Label descontada das taxas operacionais e custos de plataforma."
  };

  const renderHelpIcon = (id: string, alignRight = false) => (
    <div className="relative inline-block shrink-0">
      <button
        onMouseEnter={() => setActiveTooltip(id)}
        onMouseLeave={() => setActiveTooltip(null)}
        onClick={() => setActiveTooltip(activeTooltip === id ? null : id)}
        className="text-slate-400 hover:text-slate-700 transition-colors p-0.5 focus:outline-none"
      >
        <HelpCircle size={12} />
      </button>

      {activeTooltip === id && (
        <div
          className={`absolute z-30 p-2.5 rounded-xl glass-panel bg-white/95 border border-slate-200/60 text-[10px] text-slate-800 leading-relaxed font-sans shadow-2xl w-48 ${
            alignRight ? 'right-0' : 'left-4'
          }`}
          style={{ bottom: '100%', marginBottom: '4px' }}
        >
          {tooltips[id]}
        </div>
      )}
    </div>
  );

  return (
    <div
      className="rounded-2xl glass-panel p-5 border border-slate-200/50 hover:border-slate-350 transition-all duration-300 space-y-4"
      id="whitelabel-balance-widget"
    >
      {/* Widget Header with Date Tag */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col text-left">
          <h3 className="text-xs font-display font-black text-slate-800 uppercase tracking-wider leading-tight">
            BALANÇO WHITE LABEL
          </h3>
          <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
            Entradas, taxas e reembolsos operacionais
          </span>
        </div>

        {/* Temporal tag label of current period */}
        <div className="px-2 py-1 rounded-lg bg-[#6225C6]/10 border border-[#6225C6]/20 text-[9px] font-mono font-bold text-[#6225C6]">
          📆 {formatDateTiny(dateStartLabel)} - {formatDateTiny(dateEndLabel)}
        </div>
      </div>

      <div className="space-y-4 pt-1">
        
        {/* SUBTABLE 1: ADQUIRÊNCIA */}
        <div className="space-y-2 pb-0.5 text-left">
          <div className="flex items-center gap-1.5 pb-1 border-b border-slate-200/60">
            <Landmark size={12} className="text-brand-blue" />
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold flex-1">
              Adquirência
            </span>
          </div>
          
          <div className="space-y-1.5 font-sans text-xs">
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-600 font-semibold flex items-center gap-1">Faturamento {renderHelpIcon('adqFaturamento')}</span>
              <span className="font-mono text-slate-800 font-bold">{data.fees.earned.label}</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-600 font-semibold flex items-center gap-1">Taxas {renderHelpIcon('adqTaxas')}</span>
              <span className="font-mono text-red-650 font-bold">-{data.fees.servicePaid.label}</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-600 font-semibold flex items-center gap-1">Estornos {renderHelpIcon('adqEstornos')}</span>
              <span className="font-mono text-slate-700 font-bold">{data.fees.chargebacks.total > 0 ? `-${data.fees.chargebacks.label}` : 'R$ 0,00'}</span>
            </div>
          </div>
        </div>

        {/* SUBTABLE 2: ANTECIPAÇÃO */}
        <div className="space-y-2 pb-0.5 text-left">
          <div className="flex items-center gap-1.5 pb-1 border-b border-slate-200/60">
            <Percent size={12} className="text-[#B27B00]" />
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold flex-1">
              Antecipação
            </span>
          </div>

          <div className="space-y-1.5 font-sans text-xs">
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-600 font-semibold flex items-center gap-1">Faturamento {renderHelpIcon('antecipacoes')}</span>
              <span className="font-mono text-[#1B874B] font-bold">+{data.anticipation.label}</span>
            </div>
          </div>
        </div>

        {/* SUBTABLE 3: COBRANÇA TECNOLOGIA */}
        <div className="space-y-2 pb-0.5 text-left">
          <div className="flex items-center gap-1.5 pb-1 border-b border-slate-200/60">
            <Settings size={12} className="text-[#6225C6]" />
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold flex-1">
              Cobrança Tecnologia
            </span>
          </div>

          <div className="space-y-1.5 font-sans text-xs">
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-600 font-semibold flex items-center gap-1">Plataforma {renderHelpIcon('tecnologia')}</span>
              <span className="font-mono text-red-650 font-bold">-{data.costs.platform.label}</span>
            </div>
          </div>
        </div>

        {/* SUMMARY GRAND TOTAL CARD */}
        <div className="pt-2 border-t border-slate-200/60" id="whitelabel-final-summary">
          <div className="relative p-3.5 rounded-2xl overflow-hidden glass-panel border border-[#1B874B]/20 bg-gradient-to-r from-[#1B874B]/5 to-slate-50 hover:border-[#1B874B]/30 transition-all duration-300">
            {/* Top Tag */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <TrendingUp size={14} className="text-[#1B874B]" />
                <span className="text-[10px] font-sans font-bold text-[#1B874B] uppercase tracking-wider">
                  Lucro Total
                </span>
              </div>
              {renderHelpIcon('lucro', true)}
            </div>

            {/* Total Value */}
            <div className="flex justify-between items-baseline mt-1">
              <span className="text-[11px] font-sans text-slate-500 font-semibold">Lucro</span>
              <span className="font-display text-lg sm:text-xl font-black text-[#1B874B] font-mono tracking-tight animate-pulse">
                {data.profit.label}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
