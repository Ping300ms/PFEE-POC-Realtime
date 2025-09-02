import { useEffect, useState, useCallback } from "react";
// @ts-ignore
import { createClient } from '@/lib/supabase/client'

export function useSharedText(documentId: number = 1) {
    const [text, setText] = useState<string>("");
    const supabase = createClient();

    // Récupérer le texte initial
    useEffect(() => {
        const fetchText = async () => {
            const { data, error } = await supabase
                .from("shared_text")
                .select("content")
                .eq("id", documentId)
                .single();

            if (!error && data) {
                setText(data.content);
            }
        };

        fetchText();

        // S'abonner aux changements
        const channel = supabase
            .channel("shared_text_changes")
            .on(
                "postgres_changes",
                { event: "UPDATE", schema: "public", table: "shared_text", filter: `id=eq.${documentId}` },
                (payload : any) => {
                    const newContent = payload.new.content as string;
                    setText(newContent);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [documentId]);

    // Fonction pour mettre à jour le texte (debounced côté appelant)
    const updateText = useCallback(
        async (newText: string) => {
            setText(newText);

            await supabase
                .from("shared_text")
                .update({ content: newText })
                .eq("id", documentId);
        },
        [documentId]
    );

    return { text, updateText };
}
