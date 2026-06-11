export interface FilterState {
  status: 'all' | 'p' | 'c'; // paid, pending, cancelled (all, paid is standard)
  dateStart: string | null;   // ISO 8601 UTC
  dateEnd: string | null;     // ISO 8601 UTC
  lang: string;               // e.g. 'last24h', 'last7d', 'last30d', 'custom'
  customer: string[] | null;  // array of customer/seller IDs or null for all
}

export interface Seller {
  id: string;
  name: string;
  email: string;
  volume: number;
}

export interface MetricCardData {
  value: number;
  previousValue: number;
  percent: number;
  isPositive: boolean;
  sparklineData: number[];
}

export interface DashboardOverview {
  volume: MetricCardData;
  count: MetricCardData;
  average: MetricCardData;
}

export interface SalesByPeriodPoint {
  dateLabel: string;
  dateKey: string;
  total: number;
  pix: number;
  card: number;
  bankslip: number;
  other: number;
}

export interface MethodBreakdown {
  pix: { raw: number; count: number; percent: number };
  card: { raw: number; count: number; percent: number };
  bankslip: { raw: number; count: number; percent: number };
  other: { raw: number; count: number; percent: number };
}

export interface WhiteLabelBalanceData {
  fees: {
    earned: { total: number; label: string };
    servicePaid: { total: number; label: string };
    chargebacks: { total: number; label: string };
  };
  anticipation: {
    total: number;
    label: string;
  };
  costs: {
    platform: { total: number; label: string };
  };
  profit: {
    total: number;
    label: string;
    isLoss: boolean;
  };
}

export interface InstallmentRow {
  installment: string; // "1x", "2x", etc.
  count: number;
  percentage: number;
}

export interface IndexData {
  creditCard: {
    cash: number;
    installments: number;
    totalCount: number;
    breakdown: InstallmentRow[];
  };
  pix: { paidCount: number; unpaidCount: number; totalCount: number; rate: number };
  bankslip: { paidCount: number; unpaidCount: number; totalCount: number; rate: number };
  other: { paidCount: number; unpaidCount: number; totalCount: number; rate: number };
}
