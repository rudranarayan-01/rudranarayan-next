// components/CodeBlock.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export default function CodeBlock({ code }: { code: string }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="relative group">
            <pre className="p-4 bg-[#1f2937] rounded-lg text-sm overflow-x-auto">
                <code>{code}</code>
            </pre>
            <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                onClick={handleCopy}
                className="absolute top-2 right-2 hidden group-hover:block bg-gray-800 hover:bg-gray-700 text-white text-xs px-3 py-1 rounded-md border border-gray-600 transition"
            >
                {copied ? '✔ Copied' : '📋 Copy'}
            </motion.button>
        </div>
    )
}
