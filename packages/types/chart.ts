export type ChartPoint = {
  label: string;
  value: number;
};

export type ChartSeries = {
  id: string;
  label: string;
  color: string;
  points: ChartPoint[];
};

export type CompanyChart = {
  id: string;
  title: string;
  subtitle: string;
  series: ChartSeries[];
};
