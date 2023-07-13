# Installs Node.js image
FROM node:14

# sets the working directory for any RUN, CMD, COPY command
# all files we put in the Docker container running the server will be in /usr/src/app (e.g. /usr/src/app/package.json)
RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

# Copies package.json, package-lock.json, tsconfig.json, .env to the root of WORKDIR
COPY ["package.json", "yarn.lock", "tsconfig.json", ".env", ".env.test", "./"]

# Copies everything in the src directory to WORKDIR/src
COPY . .

# Installs all packages
RUN yarn

# Runs the dev npm script to build & start the server
CMD yarn dev