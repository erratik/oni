export interface Status {
  serviceName: string;
  hostName: string;
  buildVersion: string;
  dependenciesCheckSuccess: true;
  primaryDependenciesCheckSuccess: boolean;
  secondaryDependenciesCheckSuccess: boolean;
  environment: string;
  statusMessages: { [key: string]: string };
}
