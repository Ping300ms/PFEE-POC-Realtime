import { useState } from "react";
import "./App.css";
import { RealtimeCursors } from "./components/realtime-cursors.tsx";

function App() {
    const [roomName, setRoomName] = useState("bonjour");
    const [username] = useState("ok");
    const [inputRoom, setInputRoom] = useState("");

    const handleJoinRoom = () => {
        if (inputRoom.trim() !== "") {
            setRoomName(inputRoom.trim());
        }
    };

    return (
        <div className="w-full min-h-screen flex flex-col items-center gap-4 p-6">
            {/* Menu de changement de salon */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={inputRoom}
                    onChange={(e) => setInputRoom(e.target.value)}
                    placeholder="Nom du salon"
                    className="border p-2 rounded"
                />
                <button
                    onClick={handleJoinRoom}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Rejoindre
                </button>
            </div>

            {/* Le composant se remonte à chaque changement de roomName */}
            <div className="w-full flex-1">
                <RealtimeCursors key={roomName} roomName={roomName} username={username} />
            </div>
        </div>
    );
}

export default App;
