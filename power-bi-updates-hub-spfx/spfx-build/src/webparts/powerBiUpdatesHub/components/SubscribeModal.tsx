import * as React from 'react';
import { Modal, TextField, Dropdown, PrimaryButton, DefaultButton, Stack, Text, MessageBar, MessageBarType } from '@fluentui/react';

export interface ISubscribeModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  onSubscribe: (email: string, name: string) => Promise<void>;
}

export const SubscribeModal: React.FC<ISubscribeModalProps> = (props) => {
  const [email, setEmail] = React.useState('');
  const [name, setName] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const canSubmit = /\S+@\S+\.\S+/.test(email) && !submitting;

  const handleSubmit = async (): Promise<void> => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await props.onSubscribe(email.trim(), name.trim());
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setEmail('');
        setName('');
        props.onDismiss();
      }, 1400);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={props.isOpen} onDismiss={props.onDismiss} isBlocking={false}>
      <Stack tokens={{ padding: 20, childrenGap: 14 }} style={{ width: 420 }}>
        <Text variant="large">Subscribe to updates</Text>
        <Text variant="small" style={{ color: '#616161' }}>
          Get a weekly digest of new updates, glitches, requests, launches, and overhauls.
          Currently open to internal team members.
        </Text>
        <TextField label="Name (optional)" value={name} onChange={(_, v) => setName(v || '')} />
        <TextField label="Work email" placeholder="name@company.com" value={email} onChange={(_, v) => setEmail(v || '')} />
        <Dropdown
          label="Frequency"
          disabled
          selectedKey="weekly"
          options={[{ key: 'weekly', text: 'Weekly digest' }]}
        />
        {submitted && (
          <MessageBar messageBarType={MessageBarType.success}>
            You&rsquo;re subscribed. Your first digest arrives next Monday.
          </MessageBar>
        )}
        <Stack horizontal horizontalAlign="end" tokens={{ childrenGap: 8 }}>
          <DefaultButton text="Cancel" onClick={props.onDismiss} disabled={submitting} />
          <PrimaryButton text="Subscribe" onClick={handleSubmit} disabled={!canSubmit} />
        </Stack>
      </Stack>
    </Modal>
  );
};
