'use client'

import React from 'react'
import DockerTutorial from '../components/DockerTutorial'


export default function BlogPage() {
    return (
        <main className="min-h-screen bg-black text-white px-6 md:px-12 py-10">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-4xl md:text-6xl font-semibold text-center mb-4 text-white tracking-tight">
                    My Dev Playbook
                </h1>
                <p className="text-center text-gray-400 mb-12 text-lg">
                    Explore hands-on tutorials, code walkthroughs, and guides from real-world projects.
                </p>

                <div className="space-y-10">
                    <DockerTutorial />
                    {/* Add more tutorials like <AnotherTutorial /> */}
                </div>
            </div>
        </main>
    )
}
