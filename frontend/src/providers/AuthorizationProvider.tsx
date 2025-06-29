import { createContext, useContext, ReactNode } from 'react';
import { useCheckAuthorizedUser } from '@/hooks/contributors';
import { useCheckLoggedInUser } from '@/hooks/user';
import { Web } from '@/types/web';

interface AuthorizationContextType {
  isResourceOwner: boolean;
  isOwner: boolean;
  canWrite: boolean;
  canRead: boolean;
  authLoading: boolean;
}

const AuthorizationContext = createContext<AuthorizationContextType | undefined>(undefined);

export const AuthorizationProvider = ({ web, children }: { web: Web | null; children: ReactNode }) => {
  const { data: user } = useCheckLoggedInUser();
  const { data: userAuthorization, isLoading: authLoading } = useCheckAuthorizedUser(web && web.webId as string);
  const { accessLevel } = userAuthorization || {
    accessLevel: 'read',
    invitePending: false,
  };

  const isResourceOwner : boolean = !!web && !!user && web.userId === user.id;
  const isOwner : boolean = accessLevel === 'owner' || isResourceOwner;
  const canWrite : boolean = accessLevel === 'write' || isOwner;
  const canRead : boolean = accessLevel === 'read' || canWrite;

  return (
    <AuthorizationContext.Provider value={{ isResourceOwner, isOwner, canWrite, canRead, authLoading }}>
      {children}
    </AuthorizationContext.Provider>
  );
};

export const useAuthorization = () => {
  const context = useContext(AuthorizationContext);
  if (context === undefined) {
    throw new Error('useAuthorization must be used within an AuthorizationProvider');
  }
  return context;
};
