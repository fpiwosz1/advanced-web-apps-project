#!/bin/bash
docker compose --env-file .env.dev up -d --build --no-start
docker compose --env-file .env.dev start postgres
docker compose --env-file .env.dev start auth-service
docker compose --env-file .env.dev start temperature-service
