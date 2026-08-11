import { WebPartContext } from '@microsoft/sp-webpart-base';

export interface IPowerBiUpdatesHubProps {
  context: WebPartContext;
  updatesListName: string;
  subscribersListName: string;
  pageSize: number;
}
