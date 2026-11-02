import { Avatar, AvatarProps, Icon } from '@chakra-ui/react';
import { forwardRef } from 'react';
import { FaQuestion } from 'react-icons/fa';

import { getAvatar } from '@/constants/avatars';
import { getUserName } from '@/utils/get-user-name';

interface PlayerAvatarProps extends Omit<AvatarProps, 'name' | 'src'> {
  user?: Pick<UserType, 'displayName' | 'photoURL'> | null;
  anonymous?: boolean;
}

export const PlayerAvatar = forwardRef<HTMLSpanElement, PlayerAvatarProps>(
  ({ user, anonymous = false, ...props }, ref) => {
    const avatar = anonymous ? undefined : getAvatar(user?.photoURL);
    const name = anonymous || !user ? 'Anônimo' : getUserName(user as UserType);

    return (
      <Avatar
        ref={ref}
        bg="app.accent"
        color="app.onAccent"
        title={name}
        // Sem `name`, o Chakra mostra o `icon`; com ele, as iniciais.
        name={avatar || anonymous ? undefined : name}
        icon={
          avatar || anonymous ? (
            <Icon
              as={avatar ? avatar.icon : FaQuestion}
              boxSize={avatar ? '65%' : '45%'}
              aria-label={name}
            />
          ) : undefined
        }
        {...props}
      />
    );
  }
);

PlayerAvatar.displayName = 'PlayerAvatar';
