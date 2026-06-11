import { FilterState, Seller, DashboardOverview, SalesByPeriodPoint, MethodBreakdown, WhiteLabelBalanceData, IndexData, InstallmentRow } from '../types';

// Mock list of customers/sellers
export const MOCK_SELLERS: Seller[] = [
  { id: 'sel_01', name: 'Prime Pagamentos', email: 'contato@primepag.com', volume: 450000 },
  { id: 'sel_02', name: 'Star Pay', email: 'financeiro@starpay.cloud', volume: 280000 },
  { id: 'sel_03', name: 'Astro Soluções', email: 'adm@astrosolucoes.com', volume: 185000 },
  { id: 'sel_04', name: 'Nebula Store', email: 'vendas@nebulastore.tech', volume: 142000 },
  { id: 'sel_05', name: 'Quantum Commerce', email: 'suporte@quantumcom.net', volume: 98000 },
  { id: 'sel_06', name: 'Titan Digital', email: 'diretoria@titandigital.io', volume: 75000 },
  { id: 'sel_07', name: 'Cosmos Merchant', email: 'faturamento@cosmosm.com', volume: 62000 },
  { id: 'sel_08', name: 'Nova Express', email: 'financeiro@novaexpress.io', volume: 45000 },
  { id: 'sel_09', name: 'Horizon Pay', email: 'integrado@horizonpay.co', volume: 38000 }
];

// Helper to calculate simple date difference in days
function getDaysDifference(startStr: string | null, endStr: string | null): number {
  if (!startStr || !endStr) return 7;
  const start = new Date(startStr);
  const end = new Date(endStr);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays || 1;
}

// Generate deterministic pseudo-random number based on a string seed
function seedRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return function() {
    h = (Math.imul(h, 48271) + 2147483647) | 0;
    return (h & 0x7FFFFFFF) / 2147483647;
  };
}

export function generateDashboardData(filters: FilterState) {
  const days = getDaysDifference(filters.dateStart, filters.dateEnd);
  
  // Create a seed from selection to keep statistics stable but unique per combination
  const selectedSellersStr = filters.customer ? filters.customer.join(',') : 'all';
  const seed = `${selectedSellersStr}-${days}-${filters.status}`;
  const rand = seedRandom(seed);

  // Calculate volume multiplier based on selected sellers
  let sellerMultiplier = 1.0;
  if (filters.customer && filters.customer.length > 0) {
    const totalSelectedVolume = MOCK_SELLERS
      .filter(s => filters.customer?.includes(s.id))
      .reduce((acc, s) => acc + s.volume, 0);
    const totalPossibleVolume = MOCK_SELLERS.reduce((acc, s) => acc + s.volume, 0);
    sellerMultiplier = totalSelectedVolume / totalPossibleVolume;
  }

  // Baseline figures (resembling the screenshot: Volume around 97,796.16 for ~3,813 txs)
  const baseAvgTotal = 97796.16;
  const baseTxs = 3813;
  const baseTicket = 25.65;

  // Scale according to days in range (e.g. 7 days has ~7x, 30 days ~30x)
  // Let's damp the scale slightly so multi-day metrics aren't astronomically huge
  const scale = (days / 1.5) * sellerMultiplier;
  const currentVolume = Math.round(baseAvgTotal * scale * (0.95 + rand() * 0.1) * 100) / 100;
  
  // Status filter adjustments (Pending or Cancelled will reduce successful volume)
  let statusFactor = 1.0;
  if (filters.status === 'p') statusFactor = 0.88; // mostly paid
  if (filters.status === 'c') statusFactor = 0.12; // cancelled amount

  const finalVolume = Math.round(currentVolume * statusFactor * 100) / 100;
  const finalCount = Math.round(baseTxs * scale * statusFactor * (0.92 + rand() * 0.15));
  const finalTicket = finalCount > 0 ? Math.round((finalVolume / finalCount) * 100) / 100 : baseTicket;

  // Percentage changes (dynamic but realistic)
  const volPercent = Math.round((rand() * 12 + 2) * 100) / 100;
  const txsPercent = Math.round((rand() * 10 + 3) * 100) / 100;
  const ticketPercent = Math.round((rand() * 5 - 1) * 100) / 100;

  // Trend directions
  const isVolPositive = rand() > 0.35; // 65% chance of positive trend
  const isTxsPositive = rand() > 0.4;
  const isTicketPositive = rand() > 0.3;

  // Generate sparkline values
  const makeSparkline = (pointsCount: number, base: number) => {
    const points: number[] = [];
    let current = base * 0.8;
    for (let i = 0; i < pointsCount; i++) {
      current += (rand() - 0.48) * (base * 0.12);
      points.push(Math.max(10, Math.round(current)));
    }
    return points;
  };

  const overview: DashboardOverview = {
    volume: {
      value: finalVolume,
      previousValue: finalVolume * (isVolPositive ? (1 - volPercent/100) : (1 + volPercent/100)),
      percent: volPercent,
      isPositive: isVolPositive,
      sparklineData: makeSparkline(10, finalVolume / 10)
    },
    count: {
      value: finalCount,
      previousValue: finalCount * (isTxsPositive ? (1 - txsPercent/100) : (1 + txsPercent/100)),
      percent: txsPercent,
      isPositive: isTxsPositive,
      sparklineData: makeSparkline(10, finalCount / 10)
    },
    average: {
      value: finalTicket,
      previousValue: finalTicket * (isTicketPositive ? (1 - ticketPercent/100) : (1 + ticketPercent/100)),
      percent: Math.abs(ticketPercent),
      isPositive: isTicketPositive,
      sparklineData: makeSparkline(10, finalTicket)
    }
  };

  // Generate timeline points for charts
  const pointsCount = Math.min(Math.max(days, 5), 30);
  const salesByPeriod: SalesByPeriodPoint[] = [];
  const start = filters.dateStart ? new Date(filters.dateStart) : new Date();
  
  for (let i = 0; i < pointsCount; i++) {
    const datePoint = new Date(start);
    datePoint.setDate(start.getDate() + i);
    const dayLabel = datePoint.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    
    // Distribute total volume realistically amongst days with some volatility
    const daySeed = rand();
    const dayTotal = (finalVolume / pointsCount) * (0.6 + daySeed * 0.8);
    
    // Split by methods: typical banking percentages: Pix 45%, CC Card 40%, Bankslip 12%, Other 3%
    const pixAmount = dayTotal * (0.42 + rand() * 0.08);
    const cardAmount = dayTotal * (0.36 + rand() * 0.08);
    const bankslipAmount = dayTotal * (0.09 + rand() * 0.04);
    const otherAmount = Math.max(0, dayTotal - pixAmount - cardAmount - bankslipAmount);

    salesByPeriod.push({
      dateLabel: dayLabel,
      dateKey: datePoint.toISOString().split('T')[0],
      total: Math.round(dayTotal * 100) / 100,
      pix: Math.round(pixAmount * 100) / 100,
      card: Math.round(cardAmount * 100) / 100,
      bankslip: Math.round(bankslipAmount * 100) / 100,
      other: Math.round(otherAmount * 100) / 100
    });
  }

  // Method total breakdown
  const pixTotalRaw = salesByPeriod.reduce((acc, p) => acc + p.pix, 0);
  const cardTotalRaw = salesByPeriod.reduce((acc, p) => acc + p.card, 0);
  const bankslipTotalRaw = salesByPeriod.reduce((acc, p) => acc + p.bankslip, 0);
  const otherTotalRaw = salesByPeriod.reduce((acc, p) => acc + p.other, 0);
  const aggregateTotal = pixTotalRaw + cardTotalRaw + bankslipTotalRaw + otherTotalRaw;

  const methodBreakdown: MethodBreakdown = {
    pix: {
      raw: Math.round(pixTotalRaw * 100) / 100,
      count: Math.round(finalCount * 0.52),
      percent: aggregateTotal > 0 ? Math.round((pixTotalRaw / aggregateTotal) * 100) : 0
    },
    card: {
      raw: Math.round(cardTotalRaw * 100) / 100,
      count: Math.round(finalCount * 0.35),
      percent: aggregateTotal > 0 ? Math.round((cardTotalRaw / aggregateTotal) * 100) : 0
    },
    bankslip: {
      raw: Math.round(bankslipTotalRaw * 100) / 100,
      count: Math.round(finalCount * 0.11),
      percent: aggregateTotal > 0 ? Math.round((bankslipTotalRaw / aggregateTotal) * 100) : 0
    },
    other: {
      raw: Math.round(otherTotalRaw * 100) / 100,
      count: Math.max(0, finalCount - Math.round(finalCount * 0.52) - Math.round(finalCount * 0.35) - Math.round(finalCount * 0.11)),
      percent: aggregateTotal > 0 ? Math.round((otherTotalRaw / aggregateTotal) * 100) : 0
    }
  };

  // Balanço White Label (Left column calculations, following the screenshot values roughly)
  // Adquirência -> Faturamento (around 97,796.16 is basically the user sales? In Screenshot, sales = 97796.16,
  // WhiteLabel Balance: Faturamento 97,796.16, Taxas 2,015.97, Estornos 0.00. Saques 99,405.27, Taxas 22.09. Lucro 2,038.06)
  const adqFaturamento = finalVolume;
  // Taxas is usually ~2.06% of faturamento
  const adqTaxas = Math.round(adqFaturamento * 0.0206 * 100) / 100;
  const adqEstornos = rand() > 0.7 ? Math.round(adqFaturamento * 0.005 * 100) / 100 : 0;

  // Antecipações:
  const anticipationFaturamento = Math.round(adqFaturamento * 0.35 * (0.85 + rand() * 0.3) * 100) / 100;

  // Cobrança Tecnologia: Plataforma costs (around 0.22% of total volume + some static flat fee)
  const platformCosts = Math.round((adqFaturamento * 0.0022 + 450) * 100) / 100;

  // Final Profit calculation: Lucro = (Fees/taxas earned from merchants) - Platform costs + Anticipation fees margin
  // To keep it clean and matching the screen's positive profit, let's design typical formula:
  // Faturamento taxas counts as earnings, platform costs as negative, anticipation charges have a profit margin.
  const finalProfit = Math.round((adqTaxas - platformCosts + anticipationFaturamento * 0.035 - adqEstornos) * 100) / 100;

  const balanceData: WhiteLabelBalanceData = {
    fees: {
      earned: { total: adqFaturamento, label: 'R$ ' + adqFaturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
      servicePaid: { total: adqTaxas, label: 'R$ ' + adqTaxas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
      chargebacks: { total: adqEstornos, label: 'R$ ' + adqEstornos.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }
    },
    anticipation: {
      total: anticipationFaturamento,
      label: 'R$ ' + anticipationFaturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    costs: {
      platform: { total: platformCosts, label: 'R$ ' + platformCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }
    },
    profit: {
      total: finalProfit,
      label: 'R$ ' + finalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      isLoss: finalProfit < 0
    }
  };

  // Indexes (Indices)
  const ccTotalCount = methodBreakdown.card.count;
  const ccCashCount = Math.round(ccTotalCount * 0.28);
  const ccInstallmentsCount = ccTotalCount - ccCashCount;

  // Individual installment steps
  const installmentBreakdown: InstallmentRow[] = [
    { installment: '1x à vista', count: ccCashCount, percentage: ccTotalCount > 0 ? Math.round((ccCashCount / ccTotalCount) * 100) : 0 },
    { installment: '2x a 6x', count: Math.round(ccInstallmentsCount * 0.55), percentage: ccTotalCount > 0 ? Math.round((Math.round(ccInstallmentsCount * 0.55) / ccTotalCount) * 100) : 0 },
    { installment: '7x a 12x', count: Math.round(ccInstallmentsCount * 0.45), percentage: ccTotalCount > 0 ? Math.round((Math.round(ccInstallmentsCount * 0.45) / ccTotalCount) * 100) : 0 },
  ];

  const indices: IndexData = {
    creditCard: {
      cash: ccCashCount,
      installments: ccInstallmentsCount,
      totalCount: ccTotalCount,
      breakdown: installmentBreakdown
    },
    pix: {
      paidCount: methodBreakdown.pix.count,
      unpaidCount: Math.round(methodBreakdown.pix.count * 0.35 * rand()),
      totalCount: methodBreakdown.pix.count + Math.round(methodBreakdown.pix.count * 0.35 * rand()),
      rate: methodBreakdown.pix.count > 0 ? Math.round((methodBreakdown.pix.count / (methodBreakdown.pix.count + Math.round(methodBreakdown.pix.count * 0.15))) * 100) : 0
    },
    bankslip: {
      paidCount: methodBreakdown.bankslip.count,
      unpaidCount: Math.round(methodBreakdown.bankslip.count * 1.5 * rand()),
      totalCount: methodBreakdown.bankslip.count + Math.round(methodBreakdown.bankslip.count * 1.5 * rand()),
      rate: methodBreakdown.bankslip.count > 0 ? Math.round((methodBreakdown.bankslip.count / (methodBreakdown.bankslip.count + Math.round(methodBreakdown.bankslip.count * 1.1))) * 100) : 0
    },
    other: {
      paidCount: methodBreakdown.other.count,
      unpaidCount: Math.round(methodBreakdown.other.count * 0.5 * rand()),
      totalCount: methodBreakdown.other.count + Math.round(methodBreakdown.other.count * 0.5 * rand()),
      rate: methodBreakdown.other.count > 0 ? Math.round((methodBreakdown.other.count / (methodBreakdown.other.count + Math.round(methodBreakdown.other.count * 0.3))) * 100) : 0
    }
  };

  return {
    overview,
    salesByPeriod,
    methodBreakdown,
    balanceData,
    indices
  };
}
