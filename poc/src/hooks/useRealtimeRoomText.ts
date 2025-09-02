import { useEffect, useRef, useState, useCallback } from "react"
import { RealtimeChannel } from "@supabase/supabase-js"
// @ts-ignore
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()
const EVENT_NAME = "realtime-room-text"

type TextEventPayload = {
    text: string
    user: { id: number; name: string }
    timestamp: number
}

export const useRealtimeRoomText = ({
                                        roomName,
                                        username,
                                    }: {
    roomName: string
    username: string
}) => {
    const [userId] = useState(() => Math.floor(Math.random() * 1000000))
    const [text, setText] = useState("")
    const channelRef = useRef<RealtimeChannel | null>(null)

    // Broadcast local text change aux autres
    const updateText = useCallback(
        (newText: string) => {
            setText(newText)
            channelRef.current?.send({
                type: "broadcast",
                event: EVENT_NAME,
                payload: {
                    text: newText,
                    user: { id: userId, name: username },
                    timestamp: Date.now(),
                } satisfies TextEventPayload,
            })
        },
        [userId, username, roomName]
    )

    // Subscribe aux updates de la room
    useEffect(() => {
        const channel = supabase.channel(roomName)
        channelRef.current = channel

        channel
            .on("broadcast", { event: EVENT_NAME }, (data: { payload: TextEventPayload }) => {
                const { user, text: incomingText } = data.payload
                if (user.id === userId) return // ignorer nos propres events
                setText(incomingText)
            })
            .subscribe()

        return () => {
            channel.unsubscribe()
        }
    }, [roomName, userId, username])

    return { text, updateText }
}
