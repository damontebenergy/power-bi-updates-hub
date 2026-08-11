import { SPFI, spfi, SPFx } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { INewSubscriberInput } from '../models/ISubscriber';

export class SubscribersService {
  private sp: SPFI;
  private listName: string;

  constructor(context: WebPartContext, listName: string) {
    this.sp = spfi().using(SPFx(context));
    this.listName = listName;
  }

  /**
   * Adds a subscriber with Frequency fixed to "Weekly digest" and Active
   * true. Frequency is still a Choice column on the list (not hardcoded
   * there) so adding an "Immediate" option later doesn't require a schema
   * change — only this default would need to change.
   */
  public async subscribe(input: INewSubscriberInput): Promise<void> {
    const existing = await this.sp.web.lists
      .getByTitle(this.listName)
      .items.filter(`Email eq '${this.escapeODataString(input.Email)}'`)
      .top(1)();

    if (existing.length > 0) {
      // Re-subscribing: flip Active back on instead of creating a duplicate row.
      await this.sp.web.lists
        .getByTitle(this.listName)
        .items.getById(existing[0].Id)
        .update({ Active: true });
      return;
    }

    await this.sp.web.lists.getByTitle(this.listName).items.add({
      Title: input.Email,
      Email: input.Email,
      Name: input.Name || '',
      Frequency: 'Weekly digest',
      SubscribedDate: new Date().toISOString(),
      Active: true,
    });
  }

  public async unsubscribe(email: string): Promise<void> {
    const existing = await this.sp.web.lists
      .getByTitle(this.listName)
      .items.filter(`Email eq '${this.escapeODataString(email)}'`)
      .top(1)();

    if (existing.length > 0) {
      await this.sp.web.lists
        .getByTitle(this.listName)
        .items.getById(existing[0].Id)
        .update({ Active: false });
    }
  }

  // Minimal guard against breaking the $filter query string on a stray quote.
  private escapeODataString(value: string): string {
    return value.replace(/'/g, "''");
  }
}
