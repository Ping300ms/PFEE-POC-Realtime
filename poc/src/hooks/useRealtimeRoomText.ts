import { useEffect, useRef, useState, useCallback } from "react"
// @ts-ignore
import { createClient } from "@/lib/supabase/client"
import { RealtimeChannel } from "@supabase/supabase-js"

const supabase = createClient()
const EVENT_NAME = "realtime-room-text"

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

export function useRealtimeRoomText(roomName: string, username: string) {
    const [text, setText] = useState("")
    const [userId] = useState(() => Math.floor(Math.random() * 1_000_000))
    const channelRef = useRef<RealtimeChannel | null>(null)
    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    const documentId = hashRoomToId(roomName)

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            const { data, error } = await supabase
                .from("shared_text")
                .select("content")
                .eq("id", documentId)
                .single()
            if (!cancelled) {
                setText(!error && data ? (data.content ?? "") : "")
            }
        })()
        return () => { cancelled = true }
    }, [documentId])

    useEffect(() => {
        const roomChannel = supabase.channel(`room:${roomName}`)
        channelRef.current = roomChannel

        roomChannel
            .on("broadcast", { event: EVENT_NAME }, (data: { payload: TextEventPayload }) => {
                const { user, text: incomingText } = data.payload
                if (user.id === userId) return // ignore our own
                setText(incomingText)
            })
            .subscribe()

        return () => { roomChannel.unsubscribe() }
    }, [roomName, userId])

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
        [documentId, userId, username]
    )

    useEffect(() => {
        return () => { if (saveTimer.current) clearTimeout(saveTimer.current) }
    }, [])

    return { text, updateText }
}
