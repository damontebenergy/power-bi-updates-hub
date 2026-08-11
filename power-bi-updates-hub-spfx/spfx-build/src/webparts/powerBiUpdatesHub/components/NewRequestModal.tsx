import * as React from 'react';
import { Modal, TextField, PrimaryButton, DefaultButton, Stack, Text } from '@fluentui/react';

export interface INewRequestModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  onSubmit: (title: string, description: string) => Promise<void>;
}

export const NewRequestModal: React.FC<INewRequestModalProps> = (props) => {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const canSubmit = title.trim().length > 0 && description.trim().length > 0 && !submitting;

  const handleSubmit = async (): Promise<void> => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await props.onSubmit(title.trim(), description.trim());
      setTitle('');
      setDescription('');
      props.onDismiss();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={props.isOpen} onDismiss={props.onDismiss} isBlocking={false}>
      <Stack tokens={{ padding: 20, childrenGap: 14 }} style={{ width: 420 }}>
        <Text variant="large">New request</Text>
        <TextField
          label="Report or dashboard"
          placeholder="e.g. Inventory dashboard"
          value={title}
          onChange={(_, v) => setTitle(v || '')}
        />
        <TextField
          label="Description"
          multiline
          rows={3}
          placeholder="What do you need changed or added?"
          value={description}
          onChange={(_, v) => setDescription(v || '')}
        />
        <Stack horizontal horizontalAlign="end" tokens={{ childrenGap: 8 }}>
          <DefaultButton text="Cancel" onClick={props.onDismiss} disabled={submitting} />
          <PrimaryButton text="Submit request" onClick={handleSubmit} disabled={!canSubmit} />
        </Stack>
      </Stack>
    </Modal>
  );
};
