// @ts-ignore
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'
import { useCallback, useEffect, useRef, useState } from 'react'

const useThrottleCallback = <Params extends unknown[], Return>(
    callback: (...args: Params) => Return,
    delay: number
) => {
  const lastCall = useRef(0)
  const timeout = useRef<NodeJS.Timeout | null>(null)

  return useCallback(
      (...args: Params) => {
        const now = Date.now()
        const remainingTime = delay - (now - lastCall.current)

        if (remainingTime <= 0) {
          if (timeout.current) {
            clearTimeout(timeout.current)
            timeout.current = null
          }
          lastCall.current = now
          callback(...args)
        } else if (!timeout.current) {
          timeout.current = setTimeout(() => {
            lastCall.current = Date.now()
            timeout.current = null
            callback(...args)
          }, remainingTime)
        }
      },
      [callback, delay]
  )
}

const supabase = createClient()

const generateRandomColor = () => `hsl(${Math.floor(Math.random() * 360)}, 100%, 70%)`
const generateRandomNumber = () => Math.floor(Math.random() * 100)

const EVENT_NAME = 'realtime-cursor-move'

type CursorEventPayload = {
  position: {
    nx: number
    ny: number
  }
  user: { id: number; name: string }
  color: string
  timestamp: number
}

export const useRealtimeCursors = ({
                                     roomName,
                                     username,
                                     throttleMs,
                                   }: {
  roomName: string
  username: string
  throttleMs: number
}) => {
  const [color] = useState(generateRandomColor())
  const [userId] = useState(generateRandomNumber())
  const [cursors, setCursors] = useState<Record<string, CursorEventPayload>>({})

  const channelRef = useRef<RealtimeChannel | null>(null)

  const callback = useCallback(
      (event: MouseEvent) => {
        // Document-space coordinates (include scroll)
        const pageX = event.pageX
        const pageY = event.pageY

        const docEl = document.documentElement
        const docW = Math.max(docEl.scrollWidth, docEl.clientWidth, window.innerWidth)
        const docH = Math.max(docEl.scrollHeight, docEl.clientHeight, window.innerHeight)

        const payload: CursorEventPayload = {
          position: {
            nx: docW ? pageX / docW : 0,
            ny: docH ? pageY / docH : 0,
          },
          user: { id: userId, name: username },
          color,
          timestamp: Date.now(),
        }

        channelRef.current?.send({ type: 'broadcast', event: EVENT_NAME, payload })
      },
      [color, userId, username]
  )

  const handleMouseMove = useThrottleCallback(callback, throttleMs)

  useEffect(() => {
    const channel = supabase.channel(roomName)
    channelRef.current = channel

    channel
        .on('broadcast', { event: EVENT_NAME }, (data: { payload: CursorEventPayload }) => {
          const { user } = data.payload
          if (user.id === userId) return
          setCursors(prev => ({ ...prev, [user.id]: data.payload }))
        })
        .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [roomName, userId])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [handleMouseMove])

  return { cursors }
}
