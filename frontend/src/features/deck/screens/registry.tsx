import type { ScreenId } from '../deck.types'
import { Placeholder } from './Placeholder'
import { WelcomeScreen } from './welcome/WelcomeScreen'

const SCREENS: Partial<Record<ScreenId, () => React.ReactNode>> = {
  welcome: () => <WelcomeScreen />,
}

export function renderScreen(id: ScreenId): React.ReactNode {
  const screen = SCREENS[id]
  return screen ? screen() : <Placeholder id={id} />
}
