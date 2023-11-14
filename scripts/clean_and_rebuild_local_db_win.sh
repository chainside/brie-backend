#!/bin/bash
echo "####### RUNNING DB BRIE CLEANING AND REBUILD ########"
cd ..
rm ./src/migrations/*
npm run migration:clean
npm run typeorm:generate-migration --name=CreateTables
npm run typeorm:run-migrations
cp ./src/migrations-seeding/* ./src/migrations/
npm run typeorm:run-migrations

