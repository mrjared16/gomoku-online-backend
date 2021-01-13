## Description

Backend of Gomoku Online repository.

## Set up

- Create a PostgreSQL database
- Create a Google OAuth Client ID
- Install npm package

```bash
$ npm install
```

## Configuration

Modify .env file

- Change host and port
- Add created database information
- Add Google Client ID and Secret
- Add JWT Secret to sign and decode JWT access token

## Running the app

```bash
# development (watch mode)
$ npm run start:dev

# production mode
$ npm run start:prod
```

### Note

In development, server will automatically create table and relations match with entities file.
In production mode, you need to create them manually by TypeORM migration.

```
# create manually
$ npm run migrate:create

# or generate from entities class
$ npm run migrate:generate

$ npm run migrate:down (if necessary)
$ npm run migrate:up
```

## Document

API is documented by Swagger. You can access $HOST:$PORT/document to view it.
