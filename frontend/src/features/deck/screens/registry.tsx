import type { ScreenId } from '../deck.types'
import { Placeholder } from './Placeholder'
import { WelcomeScreen } from './welcome/WelcomeScreen'
import { AccountScreen } from './account/AccountScreen'
import { DegreeScreen } from './degree/DegreeScreen'
import { DownloadScreen } from './download/DownloadScreen'

const SCREENS: Partial<Record<ScreenId, () => React.ReactNode>> = {
  welcome: () => <WelcomeScreen />,
  name: () => <AccountScreen />,
  degree: () => <DegreeScreen />,
  download: () => <DownloadScreen />,
}

export function renderScreen(id: ScreenId): React.ReactNode {
  const screen = SCREENS[id]
  return screen ? screen() : <Placeholder id={id} />
}
