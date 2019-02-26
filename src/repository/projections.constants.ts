export namespace Projections {
  export const Basic: { [key: string]: number } = {
    id: 1,
    lastModified: 1,
    createdBy: 1,
    label: 1,
  };

  export const User: { [key: string]: number } = {
    lastModified: 1,
    username: 1,
  };
}
