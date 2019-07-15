export interface ITimeRangeOptions {
  from: number;
  to?: number;
  window?: any;
  rewind?: any;
}
export interface ITimeRange {
  $gte: string;
  $lte?: string;
}
