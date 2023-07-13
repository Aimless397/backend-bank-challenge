# Backend Bank Challenge

## Built With

This project was built using these main technologies

* [Express.js](https://expressjs.com//)
* [Jest.js](https://jestjs.io/)
* [Supertest](https://www.npmjs.com/package/supertest)
* [TypeScript](https://www.typescriptlang.org/)
* [Postgres](https://www.postgresql.org/)
* [Sequelize](https://sequelize.org/)
* [Docker](https://www.docker.com/)
* [JWT](https://jwt.io/)


## Setup

#### 1. Clone this repository

```
git clone https://github.com/Aimless397/backend-bank-challenge.git
```

#### 2. Install the dependencies

```
yarn install
```

#### 3. Create a ```.env``` file and use the following environment variables

```
# SERVER
PORT=

# DATABASE
DB_USER=
DB_HOST=
DB_NAME=
DB_PASSWORD=
DB_PORT=

# JWT
TOKEN_SECRET=
```

#### 4. Create a ```.env.test``` file and use the following environment variables for testing

```
# SERVER
PORT=3000

DB_USER=
DB_HOST=
DB_NAME_TEST=
DB_PASSWORD=
DB_PORT_TEST=

# JWT
TOKEN_SECRET=
```

#### 5. Start the Docker daemon (CLI, Docker Desktop, etc.) before build/running the container

#### 6. Build the Docker image from Dockerfile

```
docker-compose build
```

#### 7. Run the container with ```api``` and ```db``` services

```
docker-compose up
```

## Testing

#### 1. Create a local server in pgAdmin with the following parameters. It's important to put your Postgres password, otherwise it won't work

```
host: localhost
username: postgres
password: your_postgres_password
port: 5432
```

#### 2. Run yarn command for testing

```
yarn test
```
