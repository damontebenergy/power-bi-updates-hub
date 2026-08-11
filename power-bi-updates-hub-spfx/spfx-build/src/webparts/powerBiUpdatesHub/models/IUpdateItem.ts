export type ItemType = 'Update' | 'Glitch' | 'Request' | 'Launch' | 'Overhaul';
export type ItemStatus = 'Investigating' | 'In progress' | 'Queued' | 'Shipped' | 'Fixed' | 'Closed';
export type ItemPriority = 'High' | 'Medium' | 'Low';

export interface IUpdateItem {
  Id: number;
  Title: string;
  Type: ItemType;
  Status: ItemStatus;
  Description: string;
  Priority: ItemPriority;
  ReportLink?: { Url: string; Description: string };
  DatePosted: string;   // ISO date string
  LastUpdated: string;  // ISO date string
  SubmittedBy?: string;
}

// Shape used when creating a new item from the "New request" form.
// Status and Priority are set server-side defaults; Type is fixed to 'Request'.
export interface INewRequestInput {
  Title: string;
  Description: string;
}
