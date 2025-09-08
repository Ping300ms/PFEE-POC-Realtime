import { Cursor } from '@/components/Cursor'
import { useRealtimeCursor } from '@/hooks/useRealtimeCursor'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const THROTTLE_MS = 50

export const RealtimeCursor = ({
                                  roomName,
                                  username,
                                }: {
  roomName: string
  username: string
}) => {
  const { cursors } = useRealtimeCursor({ roomName, username, throttleMs: THROTTLE_MS })

  const [, force] = useState(0)
  useEffect(() => {
    const tick = () => force(v => v + 1)
    window.addEventListener('scroll', tick, { passive: true })
    window.addEventListener('resize', tick)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', tick)
      window.visualViewport.addEventListener('scroll', tick, { passive: true })
    }
    return () => {
      window.removeEventListener('scroll', tick)
      window.removeEventListener('resize', tick)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', tick)
        window.visualViewport.removeEventListener('scroll', tick)
      }
    }
  }, [])

  const docEl = document.documentElement
  const docW = Math.max(docEl.scrollWidth, docEl.clientWidth, window.innerWidth)
  const docH = Math.max(docEl.scrollHeight, docEl.clientHeight, window.innerHeight)

  const scrollX = window.scrollX
  const scrollY = window.scrollY

  const vvX = window.visualViewport?.offsetLeft ?? 0
  const vvY = window.visualViewport?.offsetTop ?? 0

  const overlay = (
      <div
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            transform: `translate3d(${-vvX}px, ${-vvY}px, 0)`,
          }}
      >
        {Object.keys(cursors).map((id) => {
          const c = cursors[id]
          const x = c.position.nx * docW - scrollX
          const y = c.position.ny * docH - scrollY

          return (
              <Cursor
                  key={id}
                  className="pointer-events-none absolute z-50"
                  style={{
                    top: 0,
                    left: 0,
                    transform: `translate3d(${x}px, ${y}px, 0)`,
                    transition: 'transform 20ms linear',
                    willChange: 'transform',
                  }}
                  color={c.color}
                  name={c.user.name}
              />
          )
        })}
      </div>
  )

  return createPortal(overlay, document.body)
}
