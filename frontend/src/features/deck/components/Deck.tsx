import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../deck.constants'
import type { Transition } from '../deck.types'
import { useScreenTransition } from '../useScreenTransition'
import { renderScreen } from '../screens/registry'
import type { ScreenId } from '../deck.types'

type DeckProps = {
  current: ScreenId
  transition: Transition
  scale: number
}

export function Deck({ current, transition, scale }: DeckProps) {
  const ref = useScreenTransition(transition, current)

  return (
    <div className="om-deck-viewport">
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        <div ref={ref} style={{ position: 'absolute', inset: 0, willChange: 'opacity, transform' }}>
          {renderScreen(current)}
        </div>
      </div>
    </div>
  )
}
