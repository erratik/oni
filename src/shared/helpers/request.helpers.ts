export const composeUrl = (url: string, params: any): string => {
  let uri = Object.entries(params)
    .map(([key, val]) => `${key}=${val}`)
    .join('&');
  return url + '?' + uri;
};
