// src/features/Dashboard/components/UserInfo.tsx
'use client';
import { useRouter } from 'next/navigation';
import { AuthUser } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/Buttons/Button';

interface UserInfoProps {
  user: AuthUser | null;
  isLoggingOut: boolean;
  logout: () => void;
}

export const UserInfo: React.FC<UserInfoProps> = ({
  user,
  isLoggingOut,
  logout,
}) => {
  const router = useRouter();

  return (
    <div className="card bg-base-100 shadow-xl p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">User Profile</h2>
      <p className="text-lg">Email: {user?.email ?? 'Unknown User'}</p>
      <p>
        Department: {user?.departmentId ? `ID: ${user.departmentId}` : 'N/A'}
      </p>
      <p>
        Role:{' '}
        {user?.roles?.[0]?.name
          ? `${user.roles[0].name} (Level: ${user.roles[0].level})`
          : 'N/A'}
      </p>
      <Button
        onClick={() => logout()}
        className="btn btn-secondary mt-4"
        disabled={isLoggingOut}
      >
        {isLoggingOut ? 'Logging out...' : 'Logout'}
      </Button>
    </div>
  );
};
// src/features/Dashboard/components/UserInfo.tsx
