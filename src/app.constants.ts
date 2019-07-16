export enum Attributes {
  AppName = 'datawhore',
}

export enum Sources {
  Spotify = 'spotify',
  Instagram = 'instagram',
  Twitter = 'twitter',
  Swarm = 'swarm',
  GoogleFit = 'gfit',
  GoogleApi = 'googleapi',
  FitBit = 'fitbit',
  Facebook = 'faceboook',
  Goodreads = 'goodreads',
  Reddit = 'reddit',
  Flickr = 'flickr',
  Pinterest = 'pinterest',
  Uber = 'uber',
}

export enum InjectionTokens {
  CacheService = 'CacheServiceToken',
  MongoDbConnection = 'MongoDbConnection',
  UserModel = 'UserModelToken',
  SpaceModel = 'SpaceModelToken',
  TokenModel = 'TokenModelToken',
  SettingsModel = 'SettingsModelToken',
  DropItemModel = 'DropItemModelToken',
  DropSetModel = 'DropSetModelToken',
  AttributeModel = 'AttributeModelToken',
  DropSchemaModel = 'DropSchemaModelToken',
  StatsModel = 'StatsModelToken',
}

export enum TimeFragments {
  Second = 'second',
  Minute = 'minute',
  Hour = 'hour',
  Day = 'day',
  Week = 'week',
  Month = 'month',
  Year = 'year',
}

export enum TimeFormats {
  documents = 'YYYY-MM-DDTHH:mm:ss.SSSZ',
}
