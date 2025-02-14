# Multi tenancy Boilerplate

## Requirements

- Node.js >= 18.0.1 (no Node.js installed? Try [nvm](https://github.com/nvm-sh/nvm))

## Running Services with Docker

# To start the required services (PostgreSQL, Redis, and NATS) using Docker:

```bash
# Start all services
$ npm run start:services

# Stop all services
$ npm run stop:services
```

## Installation

```bash
$ npm install
```

## Running the App

```bash
# development
$ npm run start
# watch mode
$ npm run start:dev
# production mode
$ npm run start:prod
```

## Database Migrations

```bash
# run migration scripts for main schema
$ npm run migration:run:main

# run migration scripts for tenant schemas
$ npm run migration:run:tenants

# run script to seed data into main schemas
$ npm run seed:run
```

## Tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
