// hooks/usePerfectCursors

import { PerfectCursor } from "perfect-cursors"
import { useState, useLayoutEffect, useCallback } from "react"

export function usePerfectCursors(
    cb: (point: number[]) => void,
    point?: number[]
) {
    const [pc] = useState(() => new PerfectCursor(cb))

    useLayoutEffect(() => {
        if (point) pc.addPoint(point)
        return () => pc.dispose()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pc])

    const onPointChange = useCallback(
        (point: number[]) => pc.addPoint(point),
        [pc]
    )

    return onPointChange
}