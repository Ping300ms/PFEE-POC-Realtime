import { useState, useEffect } from "react";
import { useSharedText } from "../hooks/useSharedText";

export const SharedTextArea: React.FC = () => {
    const { text, updateText } = useSharedText(1);
    const [localText, setLocalText] = useState(text);

    // Sync du state local quand un autre user modifie
    useEffect(() => {
        setLocalText(text);
    }, [text]);

    // Debounce pour éviter de spam la DB
    useEffect(() => {
        const handler = setTimeout(() => {
            if (localText !== text) {
                updateText(localText);
            }
        }, 500);

        return () => clearTimeout(handler);
    }, [localText]);

    return (
        <textarea
            style={{ width: "100%", height: "300px", padding: "8px" }}
            value={localText}
            onChange={(e) => setLocalText(e.target.value)}
            placeholder="Écrivez ici... tout le monde voit en direct !"
        />
    );
};
