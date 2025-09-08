import { useRealtimeRoomText } from "../hooks/useRealtimeRoomText"

export const RealtimeTextArea: React.FC<{ roomName: string; username: string }> = ({
                                                                                       roomName,
                                                                                       username,
                                                                                   }) => {
    const { text, updateText, lockedBy, sendLock, userId } = useRealtimeRoomText(roomName, username)

    const isLockedByOther = lockedBy != null && lockedBy.id !== userId

    return (
        <div>
            <textarea
                style={{ width: "100%", height: "200px", padding: "8px" }}
                value={text}
                onChange={(e) => updateText(e.target.value)}
                placeholder={`Texte collaboratif dans la room "${roomName}"`}
                disabled={isLockedByOther}
                onFocus={() => sendLock(true)}
                onBlur={() => sendLock(false)}
            />
            {isLockedByOther && (
                <p style={{ color: "red", fontSize: "0.9em" }}>
                    Verrouillé par {lockedBy?.name}
                </p>
            )}
        </div>
    )
}
