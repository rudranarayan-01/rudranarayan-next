// components/TutorialLayout.tsx
'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

export default function TutorialLayout({ children }: { children: ReactNode }) {
    return (
        <main className="bg-black text-white min-h-screen px-6 py-10 font-['Space_Grotesk','sans-serif']">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="prose prose-invert prose-pre:bg-[#1f2937] prose-pre:text-white prose-code:font-mono max-w-3xl mx-auto"
            >
                {children}
            </motion.div>
        </main>
    )
}
