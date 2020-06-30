**NodeJS and Database**

*Project to learn the fundamentals of NodeJS with database*

1. To run the project do a clone or download the zip file, after that access the folder on terminal
or cmd and type:

```bash
yarn

or

npm install
```

2. Open the file ormconfig.json and configure your database:

```json
{
  "type": "postgres",              // database type
  "host": "localhost",             // database server
  "port": 5432,                    // database port
  "username": "postgres",          // database user
  "password": "postgres",          // database password
  "database": "gostack_desafio06", // database name
  "entities": ["./src/models/*.ts"],
  "migrations": ["./src/database/migrations/*.ts"],
  "cli": {
    "migrationsDir": "./src/database/migrations"
  }
}
```

3. Go back to the terminal e run to migrate your database:

```bash
yarn typeorm migration:run

or

npm run typeorm migration:run
```

4. To start the server run:

```bash
yarn dev:server

or

npm run dev:server
```
5. To execute some request use Insomnia or Postman


**Test**

1. To run the tests, first create the database gostack_desafio06_tests (`to change the database alter the file src/database/index.ts`) and run:

```bash
yarn test

or

npm run test
```
