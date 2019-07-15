export enum TimestampDelta {
  instagram = 'created_time',
  twitter = 'created_at',
  spotify = 'played_at',
  googleapi_activity = 'startTimeNanos,endTimeNanos',
  googleapi_location = 'Time',
  default = 'timestamp',
}

export enum DropType {
  Activity = 'activity',
  Location = 'location',
  Default = 'default',
}

export enum DropKeyType {
  Standard = 'standard',
  Custom = 'custom',
}

export enum LocationDataColumns {
  Lat = 0,
  Lng = 1,
  Alt = 2,
  Acc = 3,
  Time = 4,
  Speed = 10,
  Dly = 13,
  Dst = 14,
  Secs = 21,
  AccDst = 22,
  Quality = 23,
  Category = 29,
  TimeWithTZ = 30,
  TimeWithMS = 31,
}
