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
                    <h1 className="text-4xl font-bold text-white mb-2 justify-center">🚀 Docker Tutorial</h1>
                    <li className="text-gray-300 text-lg">
                        Docker is a open source platform
                    </li>
                    <li className="text-gray-300 text-lg">
                        Using for building, running, managing applications by packing them into a standardize unit called container.
                    </li>
                    <li className="text-gray-300 text-lg">
                        Docker has two components docker container and docker images.
                    </li>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4"
                >
                    <h2 className="text-2xl font-semibold text-white border-b border-gray-700 pb-1">Docker Container</h2>
                    <p className="text-gray-300 text-lg">
                        A standardized, executable unit of software that packages up code and all its dependencies, so the application runs quickly and reliably from one computing environment to another.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4"
                >
                    <h2 className="text-2xl font-semibold text-white border-b border-gray-700 pb-1">Docker Images</h2>
                    <li className="text-gray-300 text-lg">
                        A read-only template that contains the application code, runtime, system tools, libraries, and dependencies needed to run an application.
                    </li>
                    <li className='text-gray-300 text-lg'>A read-only template that contains the application code, runtime, system tools, libraries, and dependencies needed to run an application.
                    </li>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4"
                >
                    <h2 className="text-2xl font-semibold text-white border-b border-gray-700 pb-1">🧪 Installation</h2>
                    <p className="text-gray-300">
                        Install Docker and verify using following commands
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
                    <h2 className="text-2xl font-semibold text-white border-b border-gray-700 pb-1">Docker Hub</h2>
                    <p className='text-lg text-gray-300'>Docker hub contains all the public collections of docker images <Link className='text-blue-500' target='blank' href="https://hub.docker.com/">https://hub.docker.com/</Link></p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-4"
                >
                    <h2 className="text-2xl font-semibold text-white border-b border-gray-700 pb-1">Docker Commands</h2>

                    <li className='text-gray-300 text-lg'>docker pull IMAGE_NAME It is used to pull image from docker hub</li>
                    <CodeBlock code={`docker pull hello-world`} />

                    <li className='text-gray-300 text-lg'>docker images It shows all the available images</li>
                    <CodeBlock code={`docker images`} />

                    <li className='text-gray-300 text-lg'>docker run IMAGE_NAME Used to buiild container from image</li>
                    <CodeBlock code={`docker run hello-world`} />

                    <li className='text-gray-300 text-lg'>docker run -it IMAGE_NAME Used to buiild container from image which will run in interractive mode</li>
                    <CodeBlock code={`    docker pull ubuntu
    docker run -it ubuntu`} />
                    <li className='text-gray-300 text-lg'>Now we are inside ubuntu container</li>
                    <CodeBlock code={`    docker pull ubuntu
    docker run -it ubuntu`} />
                    <Image src="/img/Docker/image.png" alt='img' height={500} width={1000} />

                    <p className='text-gray-300 text-lg'>Let's try some ubuntum commands</p>
                    <CodeBlock code={`ls`} />
                    <Image src="/img/Docker/image-1.png" alt='img' height={500} width={1000} />

                    <p className='text-gray-300 text-lg'>Let's create a directory inside ubuntu container</p>
                    <CodeBlock code={`mkdir DIR1`} />
                    <Image src="/img/Docker/image-2.png" alt='img' height={500} width={1000} />

                    <p className='text-gray-300 text-lg'>Let's print different environment variables availbale inside ubuntu container</p>
                    <CodeBlock code={`env`} />
                    <Image src="/img/Docker/image-3.png" alt='img' height={500} width={1000} />

                    <p className='text-gray-300 text-lg'>Let's exit from the container</p>
                    <CodeBlock code={`exit`} />
                    <p className='text-gray-300 text-lg'>After the execution of exit command our container will stop running and back to system CLI</p>

                    <li className='text-gray-300 text-lg'>docker ps - To check all the running container (ps - process status)</li>
                    <CodeBlock code={`docker ps`} />
                    <p>To check all the available container</p>
                    <CodeBlock code={`docker ps -a`} />

                    <li className='text-gray-300 text-lg'>docker start CONT_NAME or CONT_ID</li>
                    <li className='text-gray-300 text-lg'>docker stop CONT_NAME or CONT_ID</li>
                    <p className='text-gray-300 text-lg'>These two comands are used to start or stop the container</p>
                    <p className='text-gray-300 text-lg'>Starting the container with container Id</p>
                    <CodeBlock code={`docker start e73ecd583380`} />
                    <p className='text-gray-300 text-lg'>Stoppng the container with name</p>
                    <CodeBlock code={`docker stop gallant_lovelace`} />
                    
                    <li className='text-gray-300 text-lg'>docker rmi IMAGE_NAME</li>
                    <p className='text-gray-300 text-lg'>This command is used to remove or destroy image</p>
                    <p className='text-gray-300 text-lg'>NB: To delete the image we need to destroy the container first</p>
                    <li>docker rm CONT_ID Used to remove container</li>
                    <Image src="/img/Docker/image-4.png" alt='img' height={500} width={1000} />

                </motion.div>
            </motion.div>
        </TutorialLayout>
    );
}
