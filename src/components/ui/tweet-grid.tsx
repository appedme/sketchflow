"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Tweet } from "react-tweet"
import { cn } from "@/lib/utils"

const tweetGridVariants = cva("max-w-4xl md:max-w-6xl px-2 mx-auto w-full", {
    variants: {
        columns: {
            1: "grid grid-cols-1",
            2: "grid grid-cols-1 sm:grid-cols-2",
            3: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
            4: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
            5: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5",
        },
    },
    defaultVariants: {
        columns: 3,
    },
})

const tweetItemVariants = cva("w-full flex flex-col", {
    variants: {
        spacing: {
            sm: "gap-2",
            md: "gap-4",
            lg: "gap-6",
        },
    },
    defaultVariants: {
        spacing: "md",
    },
})

export interface TweetGridProps
    extends VariantProps<typeof tweetGridVariants>,
    VariantProps<typeof tweetItemVariants> {
    tweets: string[]
    className?: string
}

function TweetGrid({ tweets, columns, spacing, className }: TweetGridProps) {
    const gridSpacing = spacing === 'sm' ? 'gap-2' : spacing === 'md' ? 'gap-4' : 'gap-6';

    return (
        <div className={cn(tweetGridVariants({ columns }), gridSpacing, className)}>
            {tweets.map((tweetId, i) => (
                <div
                    key={`${tweetId}-${i}`}
                    className="w-full overflow-hidden flex justify-center"
                >
                    <div className="w-full max-w-[400px]">
                        <Tweet id={tweetId} />
                    </div>
                </div>
            ))}
        </div>
    )
}

export { TweetGrid }