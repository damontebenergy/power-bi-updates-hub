import { SPFI, spfi, SPFx } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/items/get-all';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IUpdateItem, INewRequestInput } from '../models/IUpdateItem';

const SELECT_FIELDS = [
  'Id',
  'Title',
  'Type',
  'Status',
  'Description',
  'Priority',
  'ReportLink',
  'DatePosted',
  'LastUpdated',
  'Author/Title'
];
const EXPAND_FIELDS = ['Author'];

export class UpdatesService {
  private sp: SPFI;
  private listName: string;

  constructor(context: WebPartContext, listName: string) {
    this.sp = spfi().using(SPFx(context));
    this.listName = listName;
  }

  /**
   * Loads items sorted by Date posted, descending, capped at maxItems.
   * Server-side sort/select keeps the payload small; do the same for any
   * future filtering once the list grows past a few hundred rows.
   */
  public async getItems(maxItems: number): Promise<IUpdateItem[]> {
    const raw = await this.sp.web.lists
      .getByTitle(this.listName)
      .items.select(...SELECT_FIELDS)
      .expand(...EXPAND_FIELDS)
      .orderBy('DatePosted', false)
      .top(maxItems)();

    return raw.map((r: any) => ({
      Id: r.Id,
      Title: r.Title,
      Type: r.Type,
      Status: r.Status,
      Description: r.Description,
      Priority: r.Priority,
      ReportLink: r.ReportLink,
      DatePosted: r.DatePosted,
      LastUpdated: r.LastUpdated,
      SubmittedBy: r.Author ? r.Author.Title : undefined,
    }));
  }

  /**
   * Creates a new Request item. Type and Status are fixed here rather than
   * left to the caller, so every request lands in the same queue regardless
   * of what the "New request" form is allowed to submit.
   */
  public async createRequest(input: INewRequestInput): Promise<IUpdateItem> {
    const today = new Date().toISOString();
    const result = await this.sp.web.lists.getByTitle(this.listName).items.add({
      Title: input.Title,
      Description: input.Description,
      Type: 'Request',
      Status: 'Queued',
      Priority: 'Medium',
      DatePosted: today,
      LastUpdated: today,
    });
    const created = result.data;
    return {
      Id: created.Id,
      Title: created.Title,
      Type: 'Request',
      Status: 'Queued',
      Description: input.Description,
      Priority: 'Medium',
      DatePosted: today,
      LastUpdated: today,
    };
  }

  /**
   * Updates status and bumps LastUpdated in one call. Use for the common
   * "move this glitch from Investigating to Fixed" edit.
   */
  public async updateStatus(itemId: number, status: IUpdateItem['Status']): Promise<void> {
    await this.sp.web.lists.getByTitle(this.listName).items.getById(itemId).update({
      Status: status,
      LastUpdated: new Date().toISOString(),
    });
  }
}
