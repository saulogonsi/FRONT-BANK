import { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Settings, 
  LogOut, 
  Bell, 
  Sparkles, 
  Clock, 
  CalendarDays,
  Menu,
  X,
  FileText,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Type definitions
import { FilterState } from './types';

// Mock engine & sub-components
import { MOCK_SELLERS, generateDashboardData } from './data/mockData';
import SellerSelect from './components/SellerSelect';
import FilterDateRange from './components/FilterDateRange';
import TotalCards from './components/TotalCards';
import SalesCompare from './components/SalesCompare';
import SalesByMethod from './components/SalesByMethod';
import SalesByMethodLine from './components/SalesByMethodLine';
import BalanceWhiteLabel from './components/BalanceWhiteLabel';
import SalesIndex from './components/SalesIndex';

export default function App() {
  // Mobile sidebar states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Core filter states (matching routing/spec requirements)
  const [filters, setFilters] = useState<FilterState>({
    status: 'p', // default: paid ('p') as specified in the schema
    dateStart: new Date(2026, 5, 9, 0, 0, 0).toISOString(),   // Start: June 09, 2026
    dateEnd: new Date(2026, 5, 10, 23, 59, 59).toISOString(), // End: June 10, 2026 (matching screenshots)
    lang: 'last24h',
    customer: null // null = todos os sellers
  });

  // State representing data retrieval loading transitions
  const [isLoading, setIsLoading] = useState(false);

  // UTC Time updating every second for the welcome-badge clock
  const [utcTime, setUtcTime] = useState<string>('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Adjust to UTC standard representation matching environment
      const formatted = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
      setUtcTime(formatted);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync / Calculate mock report dashboard data
  const dashboardData = useMemo(() => {
    return generateDashboardData(filters);
  }, [filters]);

  // Simulate network request loading state on filter updates for high UX fidelity
  const handleFilterChange = (start: string | null, end: string | null, presetLabel: string) => {
    setIsLoading(true);
    setFilters(prev => ({
      ...prev,
      dateStart: start,
      dateEnd: end,
      lang: presetLabel
    }));
    setTimeout(() => setIsLoading(false), 400); // quick fluid state transition
  };

  const handleSellerChange = (customerIds: string[] | null) => {
    setIsLoading(true);
    setFilters(prev => ({
      ...prev,
      customer: customerIds
    }));
    setTimeout(() => setIsLoading(false), 450);
  };

  const handleStatusChange = (status: 'all' | 'p' | 'c') => {
    setIsLoading(true);
    setFilters(prev => ({
      ...prev,
      status
    }));
    setTimeout(() => setIsLoading(false), 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EFF4FE] via-[#F3EEFE] to-[#FDFBFE] text-slate-800 flex overflow-hidden font-sans relative antialiased md:font-medium selections-none" id="app-root">
      
      {/* Background Decorative Cosmic Nebula dust elements (CSS only) */}
      <div className="absolute top-[10%] left-[20%] w-[450px] h-[450px] rounded-full bg-indigo-200/40 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full bg-purple-200/35 blur-[150px] pointer-events-none" />
      <div className="absolute top-[60%] left-[5%] w-[300px] h-[300px] rounded-full bg-cyan-200/30 blur-[100px] pointer-events-none" />

      {/* --- SIDEBAR RAIL (DESKTOP) --- */}
      <aside className="hidden lg:flex w-72 shrink-0 flex-col justify-between border-r border-slate-200/60 glass-panel relative z-20 m-4 rounded-3xl" id="sidebar-desktop">
        
        {/* Top brand header */}
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-blue via-brand-purple to-indigo-400 p-0.5 shadow-[0_4px_20px_rgba(26,111,212,0.15)] flex items-center justify-center shrink-0">
              <Sparkles className="text-white animate-spin-slow" size={20} />
            </div>
            <div className="flex flex-col text-left">
              <h2 className="text-sm font-display font-black tracking-wide bg-gradient-to-r from-slate-900 via-slate-800 to-brand-blue bg-clip-text text-transparent">
                HORIZON BANKING
              </h2>
              <span className="text-[10px] font-mono tracking-widest text-[#0F5FC2] uppercase font-bold mt-0.5">
                White Label Operator
              </span>
            </div>
          </div>

          {/* Navigation items links list */}
          <nav className="mt-8 space-y-1.5" id="sidebar-nav">
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block mb-2 px-3 font-semibold text-left">
              Geral
            </span>
            {[
              { label: 'Dashboard', icon: LayoutDashboard, active: true },
              { label: 'Usuários de Conta', icon: Users, active: false, badge: 'WL' },
              { label: 'Faturamento Ext', icon: DollarSign, active: false },
              { label: 'Relatórios Fiscais', icon: FileText, active: false },
              { label: 'Ajustes / Conta', icon: Settings, active: false }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-sans tracking-wide transition-all duration-200 cursor-pointer ${
                    item.active 
                      ? 'bg-gradient-to-r from-brand-blue/15 to-brand-purple/10 text-brand-blue border border-brand-blue/20 shadow-[0_4px_15px_rgba(26,111,212,0.06)]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 hover:translate-x-1'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={item.active ? "text-brand-blue" : "text-slate-400"} />
                    <span className="font-semibold">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[8px] font-mono font-bold bg-brand-yellow/15 text-brand-yellow px-1.5 py-0.5 rounded-md">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer profile segment spacer */}
        <div className="p-4 border-t border-slate-200/50" id="sidebar-user-footer">
          <div className="p-3.5 rounded-2xl bg-white/45 border border-slate-200/50 flex items-center justify-between hover:bg-white/80 transition-all">
            <div className="flex items-center gap-3 overflow-hidden select-none">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-purple to-indigo-600 flex items-center justify-center font-display font-medium text-xs shadow-inner shrink-0 relative text-white">
                SY
                <span className="absolute bottom-[-2px] right-[-2px] w-3 h-3 rounded-full bg-brand-green border-2 border-[#EFF4FE] shrink-0" />
              </div>
              <div className="flex flex-col overflow-hidden text-left">
                <span className="text-xs font-sans font-bold text-slate-800 truncate leading-tight">
                  System Workspace
                </span>
                <span className="text-[9px] font-mono text-brand-yellow uppercase tracking-wider font-semibold mt-0.5">
                  Operador Admin
                </span>
              </div>
            </div>
            
            <button 
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100/80 transition-colors cursor-pointer"
              title="Sair do painel"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* --- PRINCIPAL CONTENT BODY SCROLLER --- */}
      <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 relative z-10 w-full" id="main-content-flow">
        
        {/* --- HEADER BAR WITH RESPONSIVE MENUS --- */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-200/40 pb-5" id="header-bar-hub">
          {/* Title and context tracking info */}
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl glass-panel text-slate-800 shrink-0 hover:bg-white/80 active:scale-[0.95]"
              >
                <Menu size={18} />
              </button>
              <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight bg-gradient-to-r from-slate-900 via-slate-850 to-slate-700 bg-clip-text text-transparent">
                Dashboard Geral
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-sans tracking-wide">
              Acompanhe suas parcerias, taxas operacionais e indicadores de desempenho transacional em tempo real.
            </p>
          </div>

          {/* Clock Widget + Profile indicators */}
          <div className="flex flex-wrap items-center gap-2.5 sm:justify-end">
            {/* UTC Clock Banner badge */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-brand-blue/15 bg-[#0F5FC2]/5 text-[#0F5FC2] text-[11px] font-mono shrink-0 font-semibold shadow-sm">
              <Clock size={13} className="text-[#0F5FC2] shrink-0 animate-pulse" />
              <span>{utcTime || 'Horário de Brasília'}</span>
            </div>

            {/* Simulated interactive Bell Notification */}
            <div className="relative shrink-0">
              <button className="p-2.5 rounded-xl glass-panel text-slate-700 hover:bg-white/85 cursor-pointer hover:scale-[1.05] transition-all relative">
                <Bell size={15} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-yellow ring-2 ring-[#EFF4FE] shrink-0 animate-bounce" />
              </button>
            </div>
          </div>
        </header>

        {/* --- WELCOME CONTEXT RADIAL CARD --- */}
        <section className="mb-6 rounded-2xl glass-panel p-5 overflow-hidden flex flex-col md:flex-row justify-between items-center gap-4 relative border border-brand-purple/15 bg-gradient-to-r from-brand-purple/5 via-brand-blue/5 to-transparent text-left">
          <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
            <div className="w-12 h-12 rounded-xl bg-brand-purple/10 flex items-center justify-center shrink-0 border border-brand-purple/20 animate-pulse">
              <Sparkles size={20} className="text-brand-purple" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-display font-bold text-slate-900 tracking-wide">
                Bem-vindo ao Workspace Administrativo!
              </h2>
              <p className="text-xs text-slate-500 max-w-xl font-sans font-normal leading-relaxed">
                Você está visualizando a consolidação financeira de todos os sellers ativos do fuso operante em <strong>June 2026</strong>. Utilize o filtro lateral de status ou seller para refinar faturamentos específicos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 bg-white/60 py-2 px-3.5 rounded-xl border border-slate-200/50 shadow-sm">
            <CalendarDays size={14} className="text-brand-blue" />
            <span className="text-[11px] font-mono text-slate-700 font-bold">10 Junho 2026</span>
          </div>
        </section>

        {/* --- DYNAMIC INTERACTIVE FILTERS ROW --- */}
        <section className="mb-6 grid grid-cols-1 md:flex items-center gap-4 p-4 rounded-3xl glass-panel select-none relative z-30" id="filters-container-block">
          
          <div className="text-left shrink-0 pb-1.5 md:pb-0">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold block mb-0.5">
              Refinar Análise
            </span>
            <span className="text-[11px] font-sans text-brand-blue font-semibold">
              Filtre sellers ou períodos
            </span>
          </div>

          {/* Status Selection Buttons (PIX only, All, Pending, etc.) */}
          <div className="flex bg-slate-100/60 p-1 rounded-xl border border-slate-200/50 self-stretch items-center gap-0.5 shrink-0" id="filter-status-selection">
            {[
              { id: 'all', label: 'Tudo' },
              { id: 'p', label: 'Compensados' },
              { id: 'c', label: 'Cancelados' }
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleStatusChange(opt.id as 'all' | 'p' | 'c')}
                className={`px-3.5 py-1.5 rounded-lg text-[10px] font-sans transition-all duration-150 cursor-pointer ${
                  filters.status === opt.id 
                    ? 'bg-gradient-to-r from-brand-blue to-cyan-600 text-white font-semibold' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/40'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Seller Selection Dropdown Column */}
          <SellerSelect 
            selectedIds={filters.customer} 
            onChange={handleSellerChange} 
          />

          {/* Date Picker Select Portal block */}
          <FilterDateRange 
            startDate={filters.dateStart} 
            endDate={filters.dateEnd} 
            lang={filters.lang} 
            onChange={handleFilterChange} 
          />

        </section>

        {/* --- CORE MASTER BOARD RESPONSIVE GRID LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start" id="dashboard-widgets-grid">
          
          {/* LEFT 2/3 COLUMN - CORE DATA CHARTS & REPORT METRICS */}
          <section className="lg:col-span-2 space-y-6" id="charts-main-column">
            
            {/* Volume counters cards block wrapper */}
            <TotalCards 
              data={dashboardData.overview} 
              loading={isLoading} 
            />

            {/* Sales Volume Spec spline timeline */}
            <SalesCompare 
              data={dashboardData.salesByPeriod} 
              loading={isLoading} 
            />

            {/* Horizontal methods breakdown + multi line timeline in nested grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <SalesByMethod 
                data={dashboardData.methodBreakdown} 
                loading={isLoading} 
              />

              <SalesByMethodLine 
                data={dashboardData.salesByPeriod} 
                loading={isLoading} 
              />

            </div>

          </section>

          {/* RIGHT 1/3 SIDEBAR COLUMN - FINAL BALANCES & RETRO CONVERSION RATIOS */}
          <section className="space-y-6" id="summary-sidebar-column">
            
            {/* White label Balance details */}
            <BalanceWhiteLabel 
              data={dashboardData.balanceData} 
              dateStartLabel={filters.dateStart}
              dateEndLabel={filters.dateEnd}
              loading={isLoading} 
            />

            {/* Conversions, credit card segments & installment details */}
            <SalesIndex 
              data={dashboardData.indices} 
              loading={isLoading} 
            />

          </section>

        </div>

      </main>

      {/* --- --- MOBILE DRAWER SLIDEOVER MENU --- --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.25 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
            />

            {/* Slideover panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 bottom-0 left-0 w-80 bg-gradient-to-br from-[#EFF4FE] to-[#FDFBFE] border-r border-slate-200/50 p-6 z-50 flex flex-col justify-between"
              id="sidebar-mobile"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-slate-200/40">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-brand-blue flex items-center justify-center shrink-0">
                      <Sparkles className="text-white shrink-0 animate-spin-slow" size={16} />
                    </div>
                    <span className="text-xs font-display font-black tracking-wider block text-slate-800 uppercase text-left">
                      HORIZON BANKING
                    </span>
                  </div>
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800"
                  >
                    <X size={18} />
                  </button>
                </div>

                <nav className="mt-8 space-y-1.5 text-left">
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block mb-2 px-3">
                    Menu Navegação
                  </span>
                  {[
                    { label: 'Dashboard', icon: LayoutDashboard, active: true },
                    { label: 'Sellers Cadastrados', icon: Users, active: false },
                    { label: 'Extratos', icon: DollarSign, active: false },
                    { label: 'Relatórios Operação', icon: FileText, active: false },
                    { label: 'Configurações', icon: Settings, active: false }
                  ].map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={idx}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
                          item.active 
                            ? 'bg-brand-blue/15 text-brand-blue font-bold border border-brand-blue/10' 
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                        }`}
                      >
                        <Icon size={14} className={item.active ? 'text-brand-blue' : 'text-slate-400'} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-slate-200/50 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0 font-display">
                    SY
                  </div>
                  <div className="flex-1 overflow-hidden min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate leading-none">System Operator</p>
                    <p className="text-[9px] font-mono text-slate-400 truncate leading-none mt-1">Admin</p>
                  </div>
                  <button className="text-slate-400 hover:text-slate-700">
                    <LogOut size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
