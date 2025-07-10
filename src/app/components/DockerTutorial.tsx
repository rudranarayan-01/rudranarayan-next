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

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-4"
                    >
                        <h2 className="text-2xl font-semibold text-white border-b border-gray-700 pb-1">Docker Network</h2>
                        <p className="text-gray-300 text-lg">Docker has the ability to create isolated network which allows Docker containers to communicate with each other and with the outside world.</p>
                        <CodeBlock code={`docker network create NETWORK_NAME`} />
                        <p className='text-gray-300 text-lg'>To check available network in our system</p>
                        <CodeBlock code={`docker network ls`} />

                        <h2 className='text-lg text-gray-300'>Developing with Docker</h2>
                        <li className='text-lg text-gray-300'>Creating a network</li>
                        <CodeBlock code={`docker network create mongo_network`} />
                        <li className='text-lg text-gray-300'>Setting up mongo and mongo-express</li>
                        <CodeBlock code={`docker run -d -p27017:27017 --name mongo --network mongo-network -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=qwerty mongo`} />
                        <Image src="/img/Docker/Screenshot 2025-07-05 184643.png" alt='img' height={500} width={1000} />
                        <p className='text-lg text-gray-300'>Mongo is pulled sucessfully and connected to port number 27017, with username admin and password qwerty
                            Now its time to pull mongo-express with the same network</p>
                        <CodeBlock code={`    docker run -d -p8081:8081 --name mongo-express --network mongo-network -e ME_CONFIG_MONGODB_ADMINUSERNAME=admin -e ME_CONFIG_MONGODB_ADMINPASSWORD=qwerty -e ME_CONFIG_MONGODB_URL="mongodb://admin:qwerty@mongo:27017" mongo-express`} />
                        <Image src={"/img/Docker/image-12.png"} alt='img' height={500} width={1000} />
                        <li className='text-gray-300 text-lg'>Now go to localhost:8081</li>
                        <p className='text-gray-300 text-lg'>username - admin <br />password - pass</p>
                        <Image src={"/img/Docker/image-13.png"} alt='img' height={500} width={1000} />
                        <p className='text-gray-300 text-lg'>Now we can see the mongo-express dashboard</p>

                        <p className='text-gray-300 text-lg'>Now we have a node js test application we run this</p>
                        <CodeBlock code={`node server.js`} />

                        <p className='text-gray-300 text-lg'>Goto localhost:5050 and fill the details and refresh the mongo-express dashboard we have a user list</p>
                        <Image src={"/img/Docker/image-14.png"} alt='img' height={500} width={1000} />
                        <p className='text-lg text-gray-300'>Now we are sucessfully connected with docker container.</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-4"
                    >
                        <h2 className="text-2xl font-semibold text-white border-b border-gray-700 pb-1">Docker Compose</h2>
                        <p className="text-gray-300 text-lg">Docker compose is a tool for defining and running multicontainer application. This will be done with the help of a .yaml file.</p>
                        <p className='text-gray-300 text-lg'>yaml - yet another markup language</p>
                        <p className='text-gray-300 text-lg'>Advantages : - Standardize way of commands - Easy to edit and modify</p>
                        <p className='text-gray-300 text-lg'>Indentation is most require in yaml file</p>
                        <Image src="/img/Docker/e.png" alt='img' height={500} width={1000} />
                        <CodeBlock code={`docker compose -f fileName.yaml ip -d`} />
                        <p className='text-gray-300 text-lg mb-10'>This up command is used when we want to create container in dettach mode.</p>
                        <CodeBlock code={`docker compose -f fileName.yaml down`} />
                        <p className='text-gray-300 text-lg mb-10'>This command is used to stop the container and remove the container</p>
                        <p className='text-gray-200 text-2xl'>Now we run this yaml file by following these instructions.</p>
                        <p className='text-gray-300 text-lg'>1. It is necessary to check wheather the container already exists , if yes then delete it before running the yaml file.</p>
                        <p className='text-lg text-gray-300'>2. Then run the compose command to create container</p>
                        <CodeBlock code={`docker compose -f mongodb.yaml up -d`} />
                        <Image src="/img/Docker/a.png" alt='img' height={500} width={1000} />
                        <p className='text-gray-300 text-lg'>Now we can see that two container are running on the spesified port</p>
                        <Image src="/img/Docker/b.png" alt='img' height={500} width={1000} />
                        <p className='text-gray-300 text-lg'>3. Now we can test is the container running or not by going to the localhost:8081 port. Simillarly username will be admin and password will be pass.</p>
                        <Image src="/img/Docker/c.png" alt='img' height={500} width={1000} />
                        <p className='text-gray-300 text-lg'>We can see here there is no database with name datapirates(we created before). It is because when we restart our container it became reset. So we create the user in same way as before</p>
                        <p className="text-lg text-gray-300">4. Go to localhost:5050 and get the doccument</p>
                        <Image src="/img/Docker/d.png" alt='img' height={500} width={1000} />
                        <p className='text-gray-300 text-lg'>5. If we want to remove the container with network.</p>
                        <CodeBlock code={`docker compose -f mongodb.yaml down`} />
                        <p className='text-gray-300 text-lg'>This will remove all the container with network.</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-4"
                    >
                        <h2 className="text-2xl font-semibold text-white border-b border-gray-700 pb-1">Dockerizing our App</h2>
                        <p className='text-lg text-gray-300'>Converting our ap to docker image then docker container.</p>
                        <p className='text-lg text-gray-500'>test app ---- docker image --- docker container</p>
                        <p className='text-lg text-gray-300'>A Dockerfile is a plain text file containing a set of instructions used to build a Docker image.</p>
                        <p className='text-lg text-gray-300'>For mode you can follow <Link className='text-blue-500' href="https://spacelift.io/blog/dockerfile">https://spacelift.io/blog/dockerfile</Link></p>
                        <p className='text-2xl text-blue-300'>Important instruction of dockerfile</p>
                        <li className='text-lg text-gray-300'>FROM Specifies the base image for the Docker image being built. It acts as the foundation upon which the rest of the image is built.</li>
                        <CodeBlock code={`FROM <base_image>`} />
                        <li className='text-lg text-gray-300'>WORKDIR Sets the working directory inside the container for subsequent instructions like RUN, COPY, CMD, etc.</li>
                        <CodeBlock code={`WORKDIR <path>`} />
                        <li className='text-lg text-gray-300'>COPY Copies files and directories from the build context (your local machine) into the image.</li>
                        <CodeBlock code={`COPY <src> <dest>`} />
                        <li className='text-lg text-gray-300'>RUN Executes shell commands during the image build process. These commands are run in new layers, and the results are committed to the image.</li>
                        <CodeBlock code={`RUN <command>`} />
                        <li className='text-lg text-gray-300'>CMD Provides default instructions for running a container based on the image. It defines the command that will be executed when a container starts without any specific command-line arguments.</li>
                        <CodeBlock code={`CMD <command>`} />
                        <li className='text-lg text-gray-300'>EXPOSE Informs Docker that the container listens on the specified network port at runtime. It is a form of documentation rather than a publishing mechanism.</li>
                        <CodeBlock code={`EXPOSE <port>`} />
                        <li className='text-lg text-gray-300'>ENV Sets environment variables that can be used within the container.</li>
                        <CodeBlock code={`ENV <name> <value>`} />
                        <Image src="/img/Docker/image-15.png" alt='img' height={500} width={1000} />
                        <p className='text-lg text-gray-300'>Now we have a dockerfile, now we build the image using the following command</p>
                        <Image src="/img/Docker/image-17.png" alt='img' height={500} width={1000} />
                        <CodeBlock code={`docker build -t testapp:1.0 .`} />
                        <Image src="/img/Docker/image-18.png" alt='img' height={500} width={1000} />
                        <p className='text-gray-300 text-lg'>Now we can check the available images by typing docker images in terminal</p>
                        <p className='text-gray-300 text-lg'>Now we can create a container from docker image</p>
                        <CodeBlock code={`docker run testapp:1.0`} />
                        <Image src="/img/Docker/image-19.png" alt='img' height={500} width={1000} />
                        <p className='text-gray-300 text-lg'>Also we can run our container in interractive mode</p>
                        <CodeBlock code={`docker run -it testapp:1.0 bash`} />
                        <p className='text-gray-300 text-lg'>Now we can see that all the files are available inside our containeer.</p>
                        <Image src="/img/Docker/image-20.png" alt='img' height={500} width={1000} />
                        <p className='text-gray-300 text-lg'>Now we can see that we have node_modules folder inside our container which we dont want. If we want to skip this folder during image building then we can just write RUN npm install inside the Dockerfile.</p>
                        <Image src="/img/Docker/image-21.png" alt='img' height={500} width={1000} />
                        <p className='text-gray-300 text-lg'>Now exit from the interractive terminal of container by typing exit inside it and enter. Now we have three docker images(we can als check by typing docker images inside the terminal). To run this three terminals simultaneously we can use the compose.</p>

                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-4"
                    >
                        <h2 className="text-2xl font-semibold text-white border-b border-gray-700 pb-1">Publishing Images in Dockerhub</h2>
                        <p className='text-lg text-gray-300'>1. Go to docker hub <Link className='text-blue-500' href=" https://hub.docker.com/"> https://hub.docker.com/</Link> and authenticate</p>
                        <p className='text-lg text-gray-300'>2. Go to My Profile --- My hub -- repository</p>
                        <p className='text-lg text-gray-300'>3. Create a repo and copy the name (may be public or private)</p>
                        <Image src="/img/Docker/image-22.png" alt='img' height={500} width={1000} />
                        <p className='text-lg text-gray-300'>4. build with that repo</p>
                        <CodeBlock code={`docker build -t rudranarayan01/testapp .`} />
                        <Image src="/img/Docker/image-23.png" alt='img' height={500} width={1000} />
                        <p className='text-gray-300 text-lg'>Now there is a new image in docker desktop wit name rudranarayan01/testapp</p>
                        <p className='text-gray-300 text-lg'>5. Now docker login in terminal with docker hub credentials (we are first logged in using doker desktop credentials so logout by entering docker logout)</p>
                        <CodeBlock code={`docker login`} />
                        <Image src="/img/Docker/image-25.png" alt='img' height={500} width={1000} />
                        <p className='text-gray-300 text-lg'>Here logged in using one time code(device verfication)</p>
                        <Image src="/img/Docker/image-24.png" alt='img' height={500} width={1000} />
                        <p className='text-gray-300 text-lg'>6. Now we can push our image to docker hub</p>
                        <CodeBlock code={`docker push rudranarayan01/testapp:latest`} />
                        <Image src="/img/Docker/image-26.png" alt='img' height={500} width={1000} />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-4"
                    >
                        <h2 className="text-2xl font-semibold text-white border-b border-gray-700 pb-1">Docker Volumes</h2>
                        <p className='text-lg text-gray-300'>Volumes are persistent data stores for containers. Containers stores data in virtual mode like if we restart the docker desktop all the data all the container will be reset. We can map multiple container in a single volume.</p>
                        <li className='text-gray-300 text-lg'>Persistent storage for containers: Data stored in a volume survives container restarts and deletions.</li>
                        <li className='text-gray-300 text-lg'>Docker managed: Volumes are created, managed, and stored by Docker, typically in /var/lib/docker/volumes on Linux.</li>
                        <li className='text-gray-300 text-lg'>Mounted to container paths: Data written to the mounted directory in the container goes to the volume.</li>
                        <li className='text-gray-300 text-lg'>Data sharing: Multiple containers can access and modify the same volume.</li>
                        <li className='text-gray-300 text-lg'>Easy backup and restore: Volumes simplify data backup and recovery processes.</li>
                        <li className='text-gray-300 text-lg'>Named vs. Anonymous: Named volumes are user-defined and recommended, while anonymous volumes are automatically created and tied to the container lifecycle.</li>
                        <li className='text-gray-300 text-lg'>Volume drivers: Allow storing volumes on remote hosts or cloud providers.</li>
                        <p className='text-gray-300 text-lg'>We use -v tag for defining volume.</p>
                        <CodeBlock code={`docker run -it -v /Users/RUDRANARAYAN/Desktop/data:/test/data ubuntu `} />
                        <p className='text-gray-300 text-lg'>Here u I am giving the path where docker container will be store, and RUDRANARAYAN is my device name or hostname.</p>
                        <p className='text-gray-300 text-lg'>Here we are mapping a local directory to a container directory</p>
                        <Image src="/img/Docker/image-27.png" alt='img' height={500} width={1000} />
                        <p className='text-gray-300 text-lg'>Now go to inside data folder  cd data, and then create two new file  touch index.html and touch server.js.</p>
                        <p className='text-gray-300 text-lg'>To mount our project we can just add a volume inside mongodb.yaml file</p>
                        <Image src="/img/Docker/image-28.png" alt='img' height={500} width={1000} />
                        <p className='text-gray-300 text-lg'>Then run the yaml file (must ensure that we have no running container)</p>
                        <CodeBlock code={`docker compose -f mongodb.yaml  up `} />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-4"
                    >
                        <h2 className="text-2xl font-semibold text-white border-b border-gray-700 pb-1">Docker Volume Commands</h2>
                        <CodeBlock code={`docker volume ls`} />
                        <CodeBlock code={`docker volume create VOL_NAME`} />
                        <CodeBlock code={`docker volume rm VOL_NAME`} />
                        <p className='text-lg text-gray-300'>Named Volumes(Managed by docker)</p>
                        <CodeBlock code={`docker run -v VOL_NAME:CONT_DIR`} />
                        <p className='text-lg text-gray-300'>Bind Mount(Managed by host only)</p>
                        <CodeBlock code={`docker run -v HOST_DIR:CONT_DIR`} />
                        <p className='text-lg text-gray-300'>Anonomous Volume (Managed by docker)</p>
                        <CodeBlock code={`docker run -v MOUNT_PATH`} />
                        <p className='text-lg text-gray-300'>Delete all ananomous volumes</p>
                        <CodeBlock code={`docker volume prune`} />
                    </motion.div>

                </motion.div>
            </motion.div>
        </TutorialLayout>
    );
}
