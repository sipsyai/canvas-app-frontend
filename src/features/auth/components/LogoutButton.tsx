import { useLogout } from '@/features/auth/hooks/useLogout';
import { Button } from '@/components/ui/Button';

export const LogoutButton = () => {
  const { mutate: logout, isPending } = useLogout();

  return (
    <Button
      onClick={() => logout()}
      disabled={isPending}
      loading={isPending}
      variant="secondary"
      size="sm"
    >
      {isPending ? 'Logging out...' : 'Logout'}
    </Button>
  );
};
