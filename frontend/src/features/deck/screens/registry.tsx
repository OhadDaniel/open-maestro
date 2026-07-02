import type { ScreenId } from '../deck.types'
import { Placeholder } from './Placeholder'
import { WelcomeScreen } from './welcome/WelcomeScreen'
import { AccountScreen } from './account/AccountScreen'
import { DegreeScreen } from './degree/DegreeScreen'
import { DownloadScreen } from './download/DownloadScreen'
import { CelebrateScreen } from './celebrate/CelebrateScreen'
import { GetKnowScreen } from './getknow/GetKnowScreen'
import { HomeScreen } from './home/HomeScreen'
import { WeekScreen } from './week/WeekScreen'
import { LessonScreen } from './lesson/LessonScreen'

const SCREENS: Partial<Record<ScreenId, () => React.ReactNode>> = {
  welcome: () => <WelcomeScreen />,
  name: () => <AccountScreen />,
  degree: () => <DegreeScreen />,
  download: () => <DownloadScreen />,
  celebrate: () => <CelebrateScreen />,
  getknow: () => <GetKnowScreen />,
  home: () => <HomeScreen />,
  week: () => <WeekScreen />,
  lesson: () => <LessonScreen />,
}

export function renderScreen(id: ScreenId): React.ReactNode {
  const screen = SCREENS[id]
  return screen ? screen() : <Placeholder id={id} />
}
