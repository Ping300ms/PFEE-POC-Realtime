import './App.css'
import {RealtimeCursors} from "./components/realtime-cursors.tsx";
import {useState} from "react";

function App() {

    const [roomName, setRoomName] = useState("");
    const [userName, setUserName] = useState("Mark Scout");

  return (
    <>
        <input value={roomName} onChange={(e) => setRoomName(e.target.value)}/>
        <input value={userName} onChange={(e) => setUserName(e.target.value)}/>
        <p>{roomName}</p>
        <p>{userName}</p>
        <div className="w-full min-h-screen">
            <RealtimeCursors roomName={roomName} username={userName} />
        </div>
    </>
  )
}

export default App
