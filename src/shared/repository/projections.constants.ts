export namespace Projections {
  export const Basic: { [key: string]: number } = {
    _id: 1,
    lastModified: 1,
    createdBy: 1,
    label: 1,
  };

  export const User: { [key: string]: number } = {
    _id: 1,
    username: 1,
    email: 1,
    firstName: 1,
    lastName: 1,
    lastModified: 1,
  };

  export const Space: { [key: string]: number } = {
    lastModified: 1,
    username: 1,
  };

  export const Settings: { [key: string]: number } = {
    lastModified: 1,
    space: 1,
    credentials: 1,
    owner: 1,
    authorization: 1,
    updatedAt: 1,
    baseUrl: 1,
  };
}
