export enum QueryRequestSources {
  Instagram = 'instagram',
}

export enum DataMethod {
  instagram = 'get',
  spotify = 'post', // used for auth & token
  spotify_default = 'get',
  googleapi = 'post', // used for auth & token
  googleapi_activity = 'post',
  googleapi_location = 'get',
}
