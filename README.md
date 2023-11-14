# RUN the project locally

Run this script: run_project_local.sh, it should run the docker compose and seed data into postgres container.

Check that you have the correct folder structure before running, example: 

brie:.
     ├── brie-backend:.
     |                └──run_project_local.sh
     └── brie-frontend

# Brie Backend Swagger UI

    - http://localhost:8080/docs
  
# Brie Frontend UI

    - http://localhost
  

# NPM commands

```sh
# Start the application using the transpiled NodeJS
npm run start

# Run the application using "ts-node"
npm run dev

# Transpile the TypeScript files
npm run build

# Internal command used during the Docker build stage
npm run build:docker

# Run the project' functional tests
npm run test

# Lint the project files using ESLint
npm run lint

# Create a new migration named MyMigration
npm run migration:create [MyMigration]

# Run the TypeORM migrations
npm run migration:run

# Revert the TypeORM migrations
npm run migration:revert
```
