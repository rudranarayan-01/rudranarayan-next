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

                    <p className='text-gray-300 text-lg'>Try some ubuntum commands</p>
                    <CodeBlock code={`ls`} />
                    <Image src="/img/Docker/image-1.png" alt='img' height={500} width={1000} />

                    <p className='text-gray-300 text-lg'>Create a directory inside ubuntu container</p>
                    <CodeBlock code={`mkdir DIR1`} />
                    <Image src="/img/Docker/image-2.png" alt='img' height={500} width={1000} />

                    <p className='text-gray-300 text-lg'>Print different environment variables availbale inside ubuntu container</p>
                    <CodeBlock code={`env`} />
                    <Image src="/img/Docker/image-3.png" alt='img' height={500} width={1000} />

                    <p className='text-gray-300 text-lg'>Exit from the container</p>
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

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-4"
                    >
                        <h2 className="text-2xl font-semibold text-white border-b border-gray-700 pb-1">Versions in docker Images</h2>
                        <p className='text-lg text-gray-300'>Docker versions are required when we want to pull a specific version of a image (image with specific tag).</p>
                        <p className='text-lg text-gray-300'>Generally if we are pulling a image from docker hub without any tag then it will pull the latest version (image with latest tag) of that image.</p>
                        <CodeBlock code={`docker pull ubuntu`} />
                        <p className='text-lg text-gray-300'>For example, if we want to pull a specific version of ubuntu image we can use the following command</p>
                        <CodeBlock code={`docker pull ubuntu:20.04`} />
                        <Image src="/img/Docker/image-5.png" alt='img' height={500} width={1000} />

                        <li className='text-gray-300 text-lg'>docker run -d IMAGE_NAME Here -d refers to dettach mode which simply refers to we can run a container in background
                        </li>
                        <p className='text-gray-300 text-lg'>NB: By default all the container runs in attach mode</p>
                        <p className='text-gray-300 text-lg'>This is compulsury to pass a root password by using -e while running the mysql image. For more details please follow <Link className='text-blue-500' href="https://hub.docker.com/_/mysql">https://hub.docker.com/_/mysql</Link></p>
                        <CodeBlock code='docker run -d -e MYSQL_ROOT_PASSWORD=secret mysql' />
                        <Image src="/img/Docker/image-6.png" alt='img' height={500} width={1000} />
                        <p className='text-gray-300 text-lg'>Here we can see a new container in docker desktop</p>
                        <Image src="/img/Docker/image-7.png" alt='img' height={500} width={1000} />
                        <li className='text-gray-300 text-lg'>docker run --name CONT_NAME -d IMAGE_NAME It is used to run an image with custom name.</li>
                        <CodeBlock code={`docker run --name mysql-older -d mysql:8.0`} />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-4"
                    >
                        <h2 className="text-2xl font-semibold text-white border-b border-gray-700 pb-1">Docker Image Layers</h2>
                        <p className='text-lg text-gray-300'>Docker images are built with a layered architecture, where each layer represents a filesystem change. This layered approach offers significant advantages, including efficient storage, faster builds, and easier version control. When we pulling two version from a single image then we have some commn layers. During installation it will show that layers alredy exists.</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-4"
                    >
                        <h2 className="text-2xl font-semibold text-white border-b border-gray-700 pb-1">Port Binding</h2>
                        <p className='text-lg text-gray-300'>Port binding is a crucial aspect of Docker that allows containers to communicate with the outside world. By default, containers are isolated from the host network, but you can expose specific ports to enable access to services running inside the container.</p>
                        <CodeBlock code={`docker run -d -e MYSQL_ROOT_PASSWORD=secret --name mysql-latest -p8080:3306 mysql`} />
                        <Image src="/img/Docker/image-8.png" alt='img' height={500} width={1000} />
                        <p className='text-gray-300 text-lg'>If once a host machine port binded with a container port then the host machine port will not bind with any container.</p>
                        <CodeBlock code={`docker run -d -e MYSQL_ROOT_PASSWORD=secret --name mysql-older -p8080:3306 mysql:8.0`} />
                        <Image src="/img/Docker/image-9.png" alt='img' height={500} width={1000} />
                        <p className='text-gray-300 text-lg'>Container post may be same but local host machine port must be different.</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-4"
                    >
                        <h2 className="text-2xl font-semibold text-white border-b border-gray-700 pb-1">Troubleshoot Commands</h2>
                        <p className='text-gray-300 text-lg'>These commands are use to check errors, which helps us to identify the root cause of the problem.</p>
                        <li className='text-gray-300 text-xl'>docker logs CONT_ID or CONT_NAME To check logs of a specific container</li>
                        <CodeBlock code='docker logs mysql-latest' />
                        <CodeBlock code='docker logs 29d086193144' />
                        <Image src="/img/Docker/image-10.png" alt='img' height={500} width={1000} />
                        <li className='text-gray-300 text-lg'>docker exec -it CONT_ID or CONT_NAME bash This command is used to access terminal inside a container (it will be in interractive mode)</li>
                        <CodeBlock code='docker exec -it mysql-latest bash' />
                        <Image src="/img/Docker/image-11.png" alt='img' height={500} width={1000} />
                        <p className='text-gray-300 text-lg'>We can exit from interractive cli using exit  command</p>
                        <li className="text-gray-300 text-lg">docker exec -it CONT_ID/bin/sh</li>
                        <p className='text-lg text-gray-300'>In some container bash is replaced as sh, so to use the terminal inside a container we can use this command also.</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-4"
                    >
                        <h2 className="text-2xl font-semibold text-white border-b border-gray-700 pb-1">DOCKER and VIRTUAL MACHINE</h2>
                        <li className="text-gray-300 text-lg">DOCKER - Only virtualise application layer by using OS kernel, for this docker is faster, light weight</li>
                        <li className='text-gray-300 text-lg'>VM - Virtualise OS kernel and Application layer</li>

                        <li className='text-gray-300 text-lg'>Docker desktop contains a small linux based virtual machine which helps us to run our applications.</li>

                    </motion.div>

                </motion.div>
            </motion.div>
        </TutorialLayout>
    );
}
