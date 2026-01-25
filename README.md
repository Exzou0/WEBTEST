# Assignment 3 

## Project Description

This project is a continuation of Assignment 2 and represents a fullstack web application.

It includes:
- Backend API built with Node.js and Express
- MongoDB database integration
- Browser-based frontend interface (HTML, CSS, JavaScript)
- Full CRUD functionality (Create, Read, Update, Delete)
- Deployment to Render


---

## Live Demo (Render)

https://<your-render-app>.onrender.com

---

## Technologies Used

Backend:
- Node.js
- Express.js
- MongoDB
- MongoDB Atlas

Frontend:
- HTML
- CSS
- JavaScript (fetch API)
- Bootstrap

Deployment:
- Render

---

## Environment Variables

The project uses environment variables stored in a .env file:

PORT=3000  
MONGODB_URI=


---

## Database

Database: MongoDB  
Collection: items

Document structure:

| Field | Type | Description |
|-----|------|------------|
| _id | ObjectId | Auto-generated identifier |
| name | String | Item name |
| price | Number | Item price |
| createdAt | Date | Creation timestamp |

---

## API Routes (CRUD)

Get all items:
GET /api/items

Get item by ID:
GET /api/items/:id

Create item:
POST /api/items

Request body example:
{
  "name": "iPhone 15",
  "price": 499999
}

Update item:
PUT /api/items/:id

Delete item:
DELETE /api/items/:id

---

## Frontend Functionality

The web interface provides:
- Display of items in a table
- Create items using a form
- Edit existing items
- Delete items using buttons
- Dynamic data loading from backend API
- No usage of Postman during demonstration


---

## Pages

/ – Home page with CRUD interface  
/about – About page  
/contact – Contact page  
/api/* – JSON API routes

---

## Error Handling

- API routes return JSON error responses
- Invalid API routes return JSON 404
- Page routes return a custom HTML 404 page
- Input validation for IDs and request bodies

---

## How to Run Locally

1. Clone the repository:
git clone <repository-url>

2. Install dependencies:
npm install

3. Create a .env file:
PORT=3000  
MONGODB_URI=your_mongodb_uri

4. Start the server:
node server.js

5. Open in browser:
http://localhost:3000

---
