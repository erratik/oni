export enum Attributes {
  AppName = 'datawhore',
}

export enum Sources {
  Spotify = 'spotify',
}

export enum InjectionTokens {
  CacheService = 'CacheServiceToken',
  MongoDbConnection = 'MongoDbConnection',
  UserModel = 'UserModelToken',
  SpaceModel = 'SpaceModelToken',
  SettingsModel = 'SettingsModelToken',
}

// todo: yuck, make a regex to know what action is being taken
export enum Paths {
  SpaceUpdate = 'spaces/update',
  SpaceCreate = 'spaces/create',
  SpaceDelete = 'spaces/delete',
  SettingsUpdate = 'settings/update',
  SettingsCreate = 'settings/create',
  SettingsDelete = 'settings/create',
  CredentialsDelete = 'settings/delete/credentials',
}
