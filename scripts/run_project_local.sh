#!/bin/bash
echo "####### RUNNING BRIE ########"
docker-compose build --no-cache
docker-compose up -d
docker build --no-cache --file "Dockerfile.Seed" --tag "brie-seeder" .
docker run  --name "brie-seeder" brie-seeder
docker rm brie-seeder
docker image rm brie-seeder