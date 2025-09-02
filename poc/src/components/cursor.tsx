import { cn } from '@/lib/utils'
import { MousePointer2 } from 'lucide-react'
import React from 'react'

export const Cursor = ({
                           className,
                           style,
                           color,
                           name,
                       }: {
    className?: string
    style?: React.CSSProperties
    color: string
    name: string
}) => {
    return (
        <div
            className={cn('pointer-events-none', className)}
            style={{
                ...style,
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                width: 'max-content',
                contain: 'layout paint',
            }}
        >
            <div style={{ lineHeight: 0 }}>
                <MousePointer2 color={color} fill={color} size={30} />
            </div>

            <div
                style={{
                    marginTop: 4,
                    padding: '4px 8px',
                    backgroundColor: color,
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 700,
                    lineHeight: 1,
                    display: 'inline-block',
                    whiteSpace: 'nowrap',
                    width: 'max-content',
                    borderRadius: 6,
                    maxWidth: 240,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}
            >
                {name}
            </div>
        </div>
    )
}
