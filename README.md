# Assignment 2 – Part 2: Database Integration and CRUD API

## Project Description

This project is an extension of **Assignment 2 – Part 1**.
It is a server-side application built with **Node.js and Express.js**, connected to a **MongoDB** database, and implements a full **CRUD REST API** for managing items.

The application demonstrates database integration, request validation, error handling, and correct usage of HTTP status codes.

---

## Technologies Used

* Node.js
* Express.js
* MongoDB
* HTML 

---

## Database

**Database used:** MongoDB

The database connection is established when the server starts.

### Collection: `items`

| Field     | Type     | Description                        |
| --------- | -------- | ---------------------------------- |
| _id       | ObjectId | Unique identifier (auto generated) |
| name      | String   | Item name                          |
| price     | Number   | Item price                         |
| createdAt | Date     | Creation date                      |

---

## API Routes (CRUD)

### Get all items

```
GET /api/items
```

Optional query parameters:

* `name` – filter items by name (case insensitive)
* `sort` – sort results (e.g. `price` or `-price`)
* `fields` – projection (e.g. `name,price`)

---

### Get item by ID

```
GET /api/items/:id
```

---

### Create new item

```
POST /api/items
```

Example request body:

```json
{
  "name": "Apple",
  "price": 300
}
```

---

### Update item

```
PUT /api/items/:id
```

Example request body:

```json
{
  "name": "Green Apple",
  "price": 320
}
```

---

### Delete item

```
DELETE /api/items/:id
```

---

## Validation & HTTP Status Codes

* **200 OK** – Successful GET, PUT, DELETE
* **201 Created** – Item successfully created
* **400 Bad Request**

  * Invalid ID
  * Missing required fields
* **404 Not Found** – Item does not exist
* **500 Internal Server Error** – Server or database error

---

## Pages

The application also serves static HTML pages:

* `/` – Home page
* `/about` – About page
* `/contact` – Contact page

---

## Error Handling

* API routes (`/api/...`) return **JSON errors**
* Page routes return a custom **404 HTML page**

This separation ensures correct behavior for both API consumers and browser users.

---

## How to Run the Project

1. Install dependencies:

```
npm install
```

2. Start the server:

```
node server.js
```

3. Open in browser:

```
http://localhost:3000
```

---

