import { CreditCard, Barcode, Flame, Shuffle, Layers } from 'lucide-react';
import { MethodBreakdown } from '../types';

interface SalesByMethodProps {
  data: MethodBreakdown | null;
  loading: boolean;
}

export default function SalesByMethod({ data, loading }: SalesByMethodProps) {
  if (loading || !data) {
    return (
      <div className="glass-panel p-5 rounded-2xl w-full" id="sales-method-skeleton">
        <div className="w-48 h-4 bg-slate-200/50 rounded-md animate-pulse mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between">
                <div className="w-24 h-3 bg-slate-200/50 rounded-md animate-pulse" />
                <div className="w-16 h-3 bg-slate-200/50 rounded-md animate-pulse" />
              </div>
              <div className="w-full h-2.5 bg-slate-200/55 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Pix Icon custom vector representation or standard Lucide Flame/Compass representing modern instant flow
  // "IconPix cyan, PickaxeIcon purple" as noted in spec, let's use Lucide icons with gorgeous style!
  const rows = [
    {
      name: 'PIX Instantâneo',
      value: data.pix.raw,
      count: data.pix.count,
      percent: data.pix.percent,
      icon: Flame, // vibrant energy
      style: 'from-cyan-500 to-teal-400',
      glow: 'shadow-[0_1px_4px_rgba(6,182,212,0.15)]',
      textColor: 'text-cyan-600'
    },
    {
      name: 'Cartão de Crédito',
      value: data.card.raw,
      count: data.card.count,
      percent: data.card.percent,
      icon: CreditCard,
      style: 'from-brand-blue to-[#6225C6]',
      glow: 'shadow-[0_1px_4px_rgba(26,111,212,0.15)]',
      textColor: 'text-[#0F5FC2]'
    },
    {
      name: 'Boleto Bancário',
      value: data.bankslip.raw,
      count: data.bankslip.count,
      percent: data.bankslip.percent,
      icon: Barcode,
      style: 'from-[#1B874B] to-emerald-400',
      glow: 'shadow-[0_1px_4px_rgba(27,135,75,0.15)]',
      textColor: 'text-[#1B874B]'
    },
    {
      name: 'Outros Meios',
      value: data.other.raw,
      count: data.other.count,
      percent: data.other.percent,
      icon: Shuffle,
      style: 'from-[#6225C6] to-[#C33FB7]',
      glow: 'shadow-[0_1px_4px_rgba(98,37,198,0.15)]',
      textColor: 'text-[#6225C6]'
    }
  ];

  return (
    <div
      className="rounded-2xl glass-panel p-5 border border-slate-200/50 hover:border-slate-350 transition-all duration-300 flex flex-col justify-between"
      id="sales-by-method-widget"
    >
      <div>
        {/* Widget Header */}
        <div className="flex items-center gap-2 mb-1.5 justify-start">
          <Layers size={18} className="text-[#6225C6]" />
          <h3 className="text-sm font-display font-bold text-slate-800 tracking-wide">
            Vendas por Método de Pagamento
          </h3>
        </div>
        <p className="text-[11px] text-slate-500 font-semibold text-left tracking-wide mb-5">
          Proporção acumulada e volumetria transacionada filtrada por canal.
        </p>

        {/* Rows stack */}
        <div className="space-y-4" id="methods-rows-container">
          {rows.map((row, idx) => {
            const Icon = row.icon;
            
            return (
              <div 
                key={idx} 
                className="group p-2.5 rounded-xl border border-transparent hover:border-slate-200/30 hover:bg-slate-50/70 transition-all duration-200"
                id={`method-row-${idx}`}
              >
                {/* Method Text Stats */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg bg-slate-100 ${row.textColor} shrink-0`}>
                      <Icon size={14} className="group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-sans font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                        {row.name}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400 font-bold lowercase">
                        {row.count.toLocaleString('pt-BR')} transações
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex flex-col">
                    <span className="text-xs font-mono font-black text-slate-850">
                      {row.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                    <span className={`text-[10px] font-sans font-bold ${row.textColor}`}>
                      {row.percent}%
                    </span>
                  </div>
                </div>

                {/* Progress bar container */}
                <div className="w-full h-2 rounded-full bg-slate-200/40 relative overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${row.style} ${row.glow}`}
                    style={{
                      width: `${row.percent}%`,
                      transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                      animation: 'barFillGlow 2s infinite alternate'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
