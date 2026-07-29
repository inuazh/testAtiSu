import { useRouter } from '@tanstack/react-router';
import { getErrorMessage } from '@/shared/api';
import { Button, StateMessage } from '@/shared/ui';

interface RouteErrorStateProps {
  title: string;
  error: Error;
}

export function RouteErrorState({ title, error }: RouteErrorStateProps) {
  const router = useRouter();

  return (
    <StateMessage
      tone="danger"
      title={title}
      description={getErrorMessage(error)}
      action={
        <Button size="sm" variant="secondary" onClick={() => void router.invalidate()}>
          Повторить
        </Button>
      }
    />
  );
}
