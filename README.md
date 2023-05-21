# Task Manager

Task Manager is a nest.js app to create, update, and list tasks. It primarily uses an orchestrator pattern blended with elements of the choreographer pattern.

## Requirements

This project uses docker and docker-compose to run. Ensure it is installed and is properly permissioned.

## Installation

Use the package manager [npm](https://www.npmjs.com/) to install packages.

```bash
npm install
```

## Note:

The project is currently set to dev mode to easily interact with the code. It can be adjusted to use the prod build by changing the target in docker-compose.yml

## To Run the app

1. **IMPORTANT: Make sure to create .env files in replacement example.env in the root!**

```bash
docker-compose up
```

## To interact via postman

1. Import the Task_manager.postman_collection.json into postman.
2. Create a user using the create user request.
3. Adjust the project's pre-request script to use the newly created user's credentials.

## To test

```bash
npm run test
```
