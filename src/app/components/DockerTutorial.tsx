'use client';

import Link from 'next/link';
import CodeBlock from './CodeBlock';
import TutorialLayout from './TutorialLayout';
import { motion } from 'framer-motion';
import Image from 'next/image';

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
            <li>Docker is a open source platform</li>
            <li>Use for building, running, managing applications by packing them into a standardize unit called container</li>
            <li>Docker has two components docker container and docker images</li>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4">
          <h2 className="text-2xl font-semibold text-white border-b border-gray-700 pb-1">Docker Container</h2>
          <p className="text-gray-300 text-lg">
            A standardized, executable unit of software that packages up code and all its dependencies, so the application runs quickly and reliably from one computing environment to another.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4">
          <h2 className="text-2xl font-semibold text-white border-b border-gray-700 pb-1">Docker Image</h2>
          <li className='text-gray-300 text-lg'>A read-only template that contains the application code, runtime, system tools, libraries, and dependencies needed to run an application.</li>
          <li className='text-gray-300 text-lg'>It's a blueprint for creating Docker containers, which are isolated instances of an application and its environment.</li>
          <li className='text-gray-300 text-lg'>Tag is like a version or varient of docker images.</li>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-semibold text-white border-b border-gray-700 pb-1">🧪 Installation</h2>
          <p className="text-gray-300 text-lg">
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
          <h2 className="text-2xl font-semibold text-white border-b border-gray-700 pb-1">Docker Commands</h2>
          <div>
            <li className='text-gray-300 text-lg mb-1'>docker pull IMAGE_NAME: It is used to pull image from docker hub</li>
            <CodeBlock code={`docker pull hello-world`} />
          </div>
          <div>
            <li className='text-gray-300 text-lg mb-1'>docker images: It shows all the available images</li>
            <CodeBlock code={`docker images`} />
          </div>
          <div>
            <li className='text-gray-300 text-lg mb-1'>docker run IMAGE_NAME Used to buiild container from image</li>
            <CodeBlock code={`docker run hello-world`} />
          </div>
          <div>
            <li className='text-gray-300 text-lg mb-1'>docker run -it IMAGE_NAME Used to buiild container from image which will run in interractive mode</li>
            <CodeBlock code={` docker pull ubuntu
 docker run -it ubuntu`} />

            <p className='text-gray-300 text-lg'>Now we are inside ubuntu container </p>
            
          </div>
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

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-semibold text-white border-b border-gray-700 pb-1">Docker Hub</h2>
          <p className='text-gray-300 text-lg'>
            Docker hub contains all the public collections of docker images <Link href="https://hub.docker.com/">https://hub.docker.com/</Link>
          </p>
        </motion.div>

      </motion.div>
    </TutorialLayout>
  );
}
