# Z&R Finance Backend API

This backend was built to handle the financial transactions, role-based access control, and analytics for the Z&R Souvenir Store. 

It satisfies all requirements for the **Finance Data Processing and Access Control Backend** assignment by modeling an e-commerce platform's administrative ledger processing.

## Tech Stack
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** SQLite (Requires zero external database setup—persists to a local `.sqlite` file instantly).
* **Authentication:** Stateless authentication using JWT (JSON Web Tokens).

## Setup & Running Locally
Since this project uses SQLite, deployment and testing is incredibly streamlined. Ensure you have [Node.js](https://nodejs.org/) installed.

1. Navigate into the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the server:
   ```bash
   node index.js
   ```

The API will start on `http://localhost:3000`.

### Visual API Testing
For your convenience, I have included a minimalist frontend UI that strictly tests the APIs without the need for Postman.
Open `http://localhost:3000` in your browser. 

The SQLite Database will automatically deploy a default Admin user:
* **Username:** `admin`
* **Password:** `admin123`

## Data Modeling & Access Control
The API relies on two primary entities enforcing strict role-based access control (RBAC):
1. **Users:** Assigned a role enum of `VIEWER` (Shop Clerk), `ANALYST` (Accountant), or `ADMIN` (Store Owner).
2. **Transactions:** Financial records logged as either `INCOME` (register sales) or `EXPENSE` (inventory/restock).

### Endpoints
* `POST /api/auth/login`: Issues a JWT token assigning roles.
* `POST /api/auth/register`: Restricted to **ADMIN**. Opens an account for newly recruited staff.
* `GET /api/transactions`: Fetches the ledger. Supports query parameters for filtering (`?type=INCOME&category=Souvenirs`).
* `POST /api/transactions`: Restricted to **ANALYST** and **ADMIN**. Drops a new record into the ledger.
* `PUT /api/transactions/:id` & `DELETE`: Strictly restricted to **ADMIN**.
* `GET /api/dashboard/summary`: Calculated at runtime (Total Income, Expenses, and Net Balance). Restricted to **ANALYST** and **ADMIN**.
