export enum ResponseItemsPath {
  instagram = 'data',
  spotify = 'items',
  googleapi = 'bucket',
}

export enum TimestampField {
  instagram = 'created_time',
  spotify = 'played_at',
  googleapi = 'startTimeNanos,endTimeNanos',
}

export enum TimestampFormat {
  instagram = 'x',
  spotify = 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  googleapi = 'x',
}

export enum DropKeyType {
  Standard = 'standard',
  Custom = 'custom',
}
