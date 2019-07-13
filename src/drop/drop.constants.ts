export enum ResponseItemsPath {
  instagram = 'data',
  spotify = 'items',
  googleapi_activity = 'bucket',
  googleapi_gps = 'values',
}

export enum TimestampDelta {
  instagram = 'created_time',
  twitter = 'created_at',
  spotify = 'played_at',
  googleapi_activity = 'startTimeNanos,endTimeNanos',
  googleapi_gps = 'Time',
}

export enum TimestampFormat {
  instagram = 'x',
  googleapi = 'x',
  spotify = 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  twitter = 'ddd MMM DD HH:mm:ss Z YYYY',
}
// "Sat Jul 06 00:43:02 +0000 2019"

export enum DropType {
  Activity = 'activity',
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

export enum Numbers {
  MaxRows = 2000,
}
