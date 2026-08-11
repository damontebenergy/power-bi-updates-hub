import * as React from 'react';
import { PrimaryButton, DefaultButton, Spinner, SpinnerSize } from '@fluentui/react';
import { IPowerBiUpdatesHubProps } from './IPowerBiUpdatesHubProps';
import { IUpdateItem, ItemType, ItemPriority } from '../models/IUpdateItem';
import { UpdatesService } from '../services/UpdatesService';
import { SubscribersService } from '../services/SubscribersService';
import { ItemCard } from './ItemCard';
import { NewRequestModal } from './NewRequestModal';
import { SubscribeModal } from './SubscribeModal';
import styles from './PowerBiUpdatesHub.module.scss';

type TypeFilter = 'all' | ItemType;
type PriorityFilter = 'all' | ItemPriority;
type SortMode = 'recent' | 'status';

const STATUS_ORDER: Record<IUpdateItem['Status'], number> = {
  Investigating: 0,
  'In progress': 1,
  Queued: 2,
  Shipped: 3,
  Fixed: 4,
  Closed: 5,
};

export const PowerBiUpdatesHub: React.FC<IPowerBiUpdatesHubProps> = (props) => {
  const [items, setItems] = React.useState<IUpdateItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | undefined>(undefined);

  const [typeFilter, setTypeFilter] = React.useState<TypeFilter>('all');
  const [priorityFilter, setPriorityFilter] = React.useState<PriorityFilter>('all');
  const [sortMode, setSortMode] = React.useState<SortMode>('recent');
  const [search, setSearch] = React.useState('');

  const [isRequestOpen, setIsRequestOpen] = React.useState(false);
  const [isSubscribeOpen, setIsSubscribeOpen] = React.useState(false);

  const updatesService = React.useMemo(
    () => new UpdatesService(props.context, props.updatesListName),
    [props.context, props.updatesListName]
  );
  const subscribersService = React.useMemo(
    () => new SubscribersService(props.context, props.subscribersListName),
    [props.context, props.subscribersListName]
  );

  const loadItems = React.useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const result = await updatesService.getItems(props.pageSize);
      setItems(result);
    } catch (e) {
      setError('Could not load updates. Check that the list name in web part settings matches the SharePoint list.');
    } finally {
      setLoading(false);
    }
  }, [updatesService, props.pageSize]);

  React.useEffect(() => {
    loadItems().catch(() => {
      /* error state already set inside loadItems */
    });
  }, [loadItems]);

  const filtered = React.useMemo(() => {
    let result = items.filter((i) => {
      if (typeFilter !== 'all' && i.Type !== typeFilter) return false;
      if (priorityFilter !== 'all' && i.Priority !== priorityFilter) return false;
      if (search && !i.Title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    if (sortMode === 'status') {
      result = [...result].sort((a, b) => STATUS_ORDER[a.Status] - STATUS_ORDER[b.Status]);
    }
    return result;
  }, [items, typeFilter, priorityFilter, search, sortMode]);

  const openIssues = items.filter((i) => i.Type === 'Glitch' && i.Status !== 'Fixed' && i.Status !== 'Closed').length;
  const updatesThisMonth = items.filter((i) => {
    const posted = new Date(i.DatePosted);
    const now = new Date();
    return i.Type === 'Update' && posted.getMonth() === now.getMonth() && posted.getFullYear() === now.getFullYear();
  }).length;
  const pendingRequests = items.filter((i) => i.Type === 'Request' && i.Status === 'Queued').length;

  const typeCount = (t: ItemType): number => items.filter((i) => i.Type === t).length;

  const handleCreateRequest = async (title: string, description: string): Promise<void> => {
    const created = await updatesService.createRequest({ Title: title, Description: description });
    setItems((prev) => [created, ...prev]);
  };

  const handleSubscribe = async (email: string, name: string): Promise<void> => {
    await subscribersService.subscribe({ Email: email, Name: name });
  };

  const filterOptionClass = (active: boolean): string =>
    active ? styles.filterOptionActive : styles.filterOption;

  return (
    <div className={styles.hub}>
      <div className={styles.commandBar}>
        <div>
          <h2 className={styles.pageHeading}>Board</h2>
          <p className={styles.pageSub}>All updates, glitches, and requests across our Power BI reports.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            className={styles.searchBox}
            type="text"
            placeholder="Search by report name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <DefaultButton text="Subscribe" onClick={() => setIsSubscribeOpen(true)} />
          <PrimaryButton text="New request" onClick={() => setIsRequestOpen(true)} />
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Open issues</div>
          <div className={styles.statValueDanger}>{openIssues}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Updates this month</div>
          <div className={styles.statValue}>{updatesThisMonth}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Pending requests</div>
          <div className={styles.statValue}>{pendingRequests}</div>
        </div>
      </div>

      <div className={styles.layout}>
        <div>
          <div className={styles.filterTitle}>Type</div>
          <div className={filterOptionClass(typeFilter === 'all')} onClick={() => setTypeFilter('all')}>
            All items <span>{items.length}</span>
          </div>
          {(['Update', 'Glitch', 'Request', 'Launch', 'Overhaul'] as ItemType[]).map((t) => (
            <div key={t} className={filterOptionClass(typeFilter === t)} onClick={() => setTypeFilter(t)}>
              {t} <span>{typeCount(t)}</span>
            </div>
          ))}

          <div className={styles.filterTitle} style={{ marginTop: 20 }}>Priority</div>
          <div className={filterOptionClass(priorityFilter === 'all')} onClick={() => setPriorityFilter('all')}>
            All priorities
          </div>
          {(['High', 'Medium', 'Low'] as ItemPriority[]).map((p) => (
            <div key={p} className={filterOptionClass(priorityFilter === p)} onClick={() => setPriorityFilter(p)}>
              {p}
            </div>
          ))}
        </div>

        <div className={styles.listContainer}>
          <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid #edebe9', padding: '0 16px' }}>
            <div
              onClick={() => setSortMode('recent')}
              style={{ padding: '10px 14px', fontSize: 13, cursor: 'pointer', fontWeight: sortMode === 'recent' ? 600 : 400, color: sortMode === 'recent' ? '#0078d4' : '#616161' }}
            >
              Most recent
            </div>
            <div
              onClick={() => setSortMode('status')}
              style={{ padding: '10px 14px', fontSize: 13, cursor: 'pointer', fontWeight: sortMode === 'status' ? 600 : 400, color: sortMode === 'status' ? '#0078d4' : '#616161' }}
            >
              By status
            </div>
          </div>

          {loading && (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <Spinner size={SpinnerSize.medium} label="Loading updates..." />
            </div>
          )}

          {!loading && error && <div className={styles.emptyState}>{error}</div>}

          {!loading && !error && filtered.length === 0 && (
            <div className={styles.emptyState}>No items match these filters.</div>
          )}

          {!loading &&
            !error &&
            filtered.map((item) => <ItemCard key={item.Id} item={item} />)}
        </div>
      </div>

      <NewRequestModal
        isOpen={isRequestOpen}
        onDismiss={() => setIsRequestOpen(false)}
        onSubmit={handleCreateRequest}
      />
      <SubscribeModal
        isOpen={isSubscribeOpen}
        onDismiss={() => setIsSubscribeOpen(false)}
        onSubscribe={handleSubscribe}
      />
    </div>
  );
};
