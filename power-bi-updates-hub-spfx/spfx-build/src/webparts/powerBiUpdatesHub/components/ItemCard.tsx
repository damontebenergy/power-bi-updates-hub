import * as React from 'react';
import { IUpdateItem } from '../models/IUpdateItem';
import styles from './PowerBiUpdatesHub.module.scss';

export interface IItemCardProps {
  item: IUpdateItem;
}

const TAG_CLASS: Record<IUpdateItem['Type'], string> = {
  Update: styles.tagUpdate,
  Glitch: styles.tagGlitch,
  Request: styles.tagRequest,
  Launch: styles.tagLaunch,
  Overhaul: styles.tagOverhaul,
};

const PRIORITY_CLASS: Record<IUpdateItem['Priority'], string> = {
  High: styles.priorityHigh,
  Medium: styles.priorityMedium,
  Low: styles.priorityLow,
};

function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export const ItemCard: React.FC<IItemCardProps> = ({ item }) => {
  return (
    <div className={styles.itemRow}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span className={TAG_CLASS[item.Type]}>{item.Type}</span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{item.Title}</span>
        </div>
        <div style={{ fontSize: 12, color: '#616161' }}>{item.Description}</div>
        {item.ReportLink && item.ReportLink.Url && (
          <a
            href={item.ReportLink.Url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 11, color: '#0078d4', display: 'inline-block', marginTop: 6 }}
          >
            Open report
          </a>
        )}
      </div>
      <div style={{ textAlign: 'right', whiteSpace: 'nowrap', flexShrink: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600 }}>
          <span className={PRIORITY_CLASS[item.Priority]} title={`${item.Priority} priority`} />
          {item.Status}
        </div>
        <div style={{ fontSize: 11, color: '#8a8886', marginTop: 2 }}>Posted {formatDate(item.DatePosted)}</div>
        <div style={{ fontSize: 11, color: '#8a8886' }}>Updated {formatDate(item.LastUpdated)}</div>
      </div>
    </div>
  );
};
