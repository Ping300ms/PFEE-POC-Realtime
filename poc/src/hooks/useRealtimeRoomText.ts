import { useEffect, useRef, useState, useCallback } from "react"
// @ts-ignore
import { createClient } from "@/lib/supabase/client"
import { RealtimeChannel } from "@supabase/supabase-js"

const supabase = createClient()
const EVENT_NAME = "realtime-room-text"
const LOCK_EVENT = "realtime-room-lock"

function hashRoomToId(roomName: string): number {
    let h = 0x811c9dc5 >>> 0 // FNV-1a 32-bit
    for (let i = 0; i < roomName.length; i++) {
        h ^= roomName.charCodeAt(i)
        h = Math.imul(h, 0x01000193)
    }
    return (h >>> 0) & 0x7fffffff
}

type TextEventPayload = {
    text: string
    user: { id: number; name: string }
    timestamp: number
}

type LockEventPayload = {
    user: { id: number; name: string }
    locked: boolean
}


export function useRealtimeRoomText(roomName: string, username: string) {
    const [text, setText] = useState("")
    const [userId] = useState(() => Math.floor(Math.random() * 1_000_000))
    const [lockedBy, setLockedBy] = useState<{ id: number; name: string } | null>(null)
    const channelRef = useRef<RealtimeChannel | null>(null)
    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    const documentId = hashRoomToId(roomName)

    // … ton code fetch initial du texte inchangé …

    useEffect(() => {
        const roomChannel = supabase.channel(`room:${roomName}`)
        channelRef.current = roomChannel

        // texte
        roomChannel
            .on("broadcast", { event: EVENT_NAME }, (data: { payload: TextEventPayload }) => {
                const { user, text: incomingText } = data.payload
                if (user.id === userId) return
                setText(incomingText)
            })
            // lock
            .on("broadcast", { event: LOCK_EVENT }, (data: { payload: LockEventPayload }) => {
                const { user, locked } = data.payload
                if (locked) {
                    setLockedBy(user)
                } else {
                    setLockedBy(null)
                }
            })
            .subscribe()

        return () => {
            roomChannel.unsubscribe()
        }
    }, [roomName, userId])

    const updateText = useCallback(
        (newText: string) => {
            if (lockedBy && lockedBy.id !== userId) return // bloqué par un autre
            setText(newText)

            channelRef.current?.send({
                type: "broadcast",
                event: EVENT_NAME,
                payload: {
                    text: newText,
                    user: { id: userId, name: username },
                    timestamp: Date.now(),
                } as TextEventPayload,
            })

            if (saveTimer.current) clearTimeout(saveTimer.current)
            saveTimer.current = setTimeout(async () => {
                await supabase
                    .from("shared_text")
                    .upsert({ id: documentId, content: newText })
                    .eq("id", documentId)
            }, 300)
        },
        [documentId, userId, username, lockedBy]
    )

    const sendLock = useCallback((locked: boolean) => {
        channelRef.current?.send({
            type: "broadcast",
            event: LOCK_EVENT,
            payload: { user: { id: userId, name: username }, locked },
        })
        setLockedBy(locked ? { id: userId, name: username } : null)
    }, [userId, username])

    return { text, updateText, lockedBy, sendLock, userId }
}
