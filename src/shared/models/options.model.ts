export interface ITimeRangeOptions {
  from: number;
  to?: number;
  unit?: any;
  rewind?: any;
  timewindow: ITimeWindow;
}

export interface ITimeWindow {
  unit: string;
  period?: number;
  pin?: boolean;
}
export interface ITimeRange {
  $gte: string;
  $lte?: string;
}
