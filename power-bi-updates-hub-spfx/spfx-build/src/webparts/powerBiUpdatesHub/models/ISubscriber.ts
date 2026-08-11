export type SubscriberFrequency = 'Weekly digest';

export interface ISubscriber {
  Id: number;
  Email: string;
  Name?: string;
  Frequency: SubscriberFrequency;
  SubscribedDate: string;
  Active: boolean;
}

export interface INewSubscriberInput {
  Email: string;
  Name?: string;
}
