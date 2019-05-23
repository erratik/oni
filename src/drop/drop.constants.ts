export enum ResponseItemsPath {
  instagram = 'data',
  spotify = 'items',
  googleapi = 'bucket',
  googleapi_location = 'values',
}

export enum TimestampField {
  instagram = 'created_time',
  spotify = 'played_at',
  googleapi = 'startTimeNanos,endTimeNanos',
  googleapi_location = 'Time',
}

export enum TimestampFormat {
  instagram = 'x',
  spotify = 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  googleapi = 'x',
}

export enum DropType {
  Activity = 'googlefit-activity',
  GPS = 'gps',
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
