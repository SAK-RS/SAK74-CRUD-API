# CRUD API

This project implements a simple CRUD API for user management using Node.js and ES modules. It allows you to create, retrieve, update, and delete users.

## Installation

1. **Clone the repository**
   ```sh
   git clone <repository-url>
   cd sak74-crud-api
   ```
2. **Install dependencies**
   ```sh
   npm install
   ```
3. **Environment Setup**
   Copy the example environment file to create your own:
   ```sh
    cp .env.example .env
   ```
   Adjust the `.env` file as needed (e.g., setting the PORT).

## Running the Application

The application supports multiple modes:

Development Mode

- Single-process (with auto-reload on changes)

```sh
npm run start:dev
```

- Multi-process (using clustering)

```sh
npm run start:multi
```

Production Mode  
Build and run the application in production mode:

```sh
npm run start:prod
```

This command first builds the application using `pkgroll` and then starts the server from the index.mjs file.

### API Endpoints

The API is available under the `/api/users` endpoint.

- **GET /api/users**  
  Retrieves all users.

- **GET /api/users/{id}**  
  Retrieves a single user by ID.

  - Returns 400 if the ID is invalid.
  - Returns 404 if the user is not found.

- **POST /api/users**  
  Creates a new user.  
  **Request Body (JSON):**

```json
{
  "username": "John",
  "age": 30,
  "hobbies": ["coding"]
}
```

- **PUT /api/users/{id}**  
  Updates an existing user.  
  **Request Body (JSON):**

```json
{
  "username": "John Updated",
  "age": 35,
  "hobbies": ["no-coding"]
}
```

- **DELETE /api/users/{id}**  
  Deletes the user.

#### Running Tests

Automated tests are available in the project. To run the tests:

```sh
npm test
```
