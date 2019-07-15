export namespace Projections {
  export const Basic: { [key: string]: number } = {
    _id: 1,
    updatedAt: 1,
    createdBy: 1,
    label: 1,
  };

  export const User: { [key: string]: number } = {
    _id: 1,
    username: 1,
    email: 1,
    firstName: 1,
    lastName: 1,
    updatedAt: 1,
  };

  export const Space: { [key: string]: number } = {
    updatedAt: 1,
    owner: 1,
  };

  export const Settings: { [key: string]: number } = {
    updatedAt: 1,
    space: 1,
    credentials: 1,
    owner: 1,
    authorization: 1,
    baseUrl: 1,
  };

  export const DropSets: { [key: string]: number } = {
    updatedAt: 1,
    space: 1,
    endpoint: 1,
    navigation: 1,
    owner: 1,
    type: 1,
    cron: 1,
    drops: 1,
    params: 1,
  };
}
