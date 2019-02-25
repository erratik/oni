export enum InjectionTokens {
  CacheService = 'CacheServiceToken',
  MongoDbConnection = 'MongoDbConnection',
  UserModel = 'UserModelToken',
}

export enum UbiServicesTicketScheme {
  S2S = 'ubi_s2s_v1',
  Admin = 'ubi_v1',
}

export enum AuthenticationHeaders {
  Authorization = 'authorization',
  UbiSessionId = 'ubi-sessionid',
  UbiAppId = 'ubi-appid',
}

export enum ResponseMessages {
  Success = 'Success',
  FailureDelete = 'Failed to delete resource',
}
