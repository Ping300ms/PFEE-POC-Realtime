import { useRealtimeRoomText } from "../hooks/useRealtimeRoomText"

export const RealtimeTextArea: React.FC<{ roomName: string; username: string }> = ({
                                                                                       roomName,
                                                                                       username,
                                                                                   }) => {
    const { text, updateText } = useRealtimeRoomText(roomName, username)

    return (
        <textarea
            style={{ width: "100%", height: "200px", padding: "8px" }}
            value={text}
            onChange={(e) => updateText(e.target.value)}
            placeholder={`Texte collaboratif dans la room "${roomName}"`}
        />
    )
}
