import {
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
} from '@chakra-ui/react';
import { useState } from 'react';
import { FaVolumeMute, FaVolumeUp } from 'react-icons/fa';

import {
  changeSoundSettings,
  getSoundSettings,
  SoundSettings,
} from '@/utils/sound';

export function SoundMenu(): JSX.Element {
  const [settings, setSettings] = useState<SoundSettings>(getSoundSettings);

  const isMuted = !settings.music && !settings.effects;

  function handleChange(value: string | string[]): void {
    const newSettings = {
      music: value.includes('music'),
      effects: value.includes('effects'),
    };

    changeSoundSettings(newSettings);
    setSettings(newSettings);
  }

  return (
    <Menu closeOnSelect={false} placement="bottom-end">
      <MenuButton
        as={IconButton}
        aria-label="Ajustar o som"
        icon={<Icon as={isMuted ? FaVolumeMute : FaVolumeUp} />}
      />

      <MenuList zIndex="popover">
        <MenuOptionGroup
          title="Som"
          type="checkbox"
          value={[
            ...(settings.music ? ['music'] : []),
            ...(settings.effects ? ['effects'] : []),
          ]}
          onChange={handleChange}
        >
          <MenuItemOption value="music">Música</MenuItemOption>
          <MenuItemOption value="effects">Efeitos</MenuItemOption>
        </MenuOptionGroup>
      </MenuList>
    </Menu>
  );
}
