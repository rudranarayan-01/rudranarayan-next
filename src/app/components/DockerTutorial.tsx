'use client';

import CodeBlock from './CodeBlock';
import TutorialLayout from './TutorialLayout';
import { motion } from 'framer-motion';

export default function DockerTutorial() {
    return (
        <TutorialLayout>
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-10"
            >
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h1 className="text-4xl font-bold text-white mb-2">🚀 Docker Tutorial</h1>
                    <p className="text-gray-300 text-lg">
                        Docker is a platform for packaging apps into containers.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4"
                >
                    <h2 className="text-2xl font-semibold text-white border-b border-gray-700 pb-1">🧪 Installation</h2>
                    <p className="text-gray-300">
                        Install Docker and verify it's working using the following commands:
                    </p>
                    <CodeBlock code={`docker
docker -v`} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-4"
                >
                    <h2 className="text-2xl font-semibold text-white border-b border-gray-700 pb-1">🎉 Run Hello World</h2>
                    <CodeBlock code={`docker run hello-world`} />
                </motion.div>
            </motion.div>
        </TutorialLayout>
    );
}
