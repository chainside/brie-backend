#!/bin/bash
echo "####### RUNNING DB BRIE CLEANING AND REBUILD UNIX ########"
cd ..
rm ./src/migrations/*
npm run migration:clean
npm run migration:generate --name=CreateTables
npm run migration:run
cp ./src/migrations-seeding/* ./src/migrations/
