export type ReportKind =
  | 'discounts'
  | 'deliveries'
  | 'commissions'
  | 'cancellations'
  | 'business-ranking';

export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}
