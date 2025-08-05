# doCraft App

A demo Inventory Management system built with **Node.js**, **Express**, **PostgreSQL**, and **Tailwind CSS**. This app allows users to manage tasks, goals, and tags – perfect for organizing productivity or store inventory-style items.

> Built as part of an educational assignment for learning backend fundamentals with PostgreSQL and Express.

---

## Features

- Add, edit, delete **tasks**, **goals**, and **tags**
- View detailed pages for each goal, task, or tag
- Associate tags and goals with tasks
- Modular structure using routes and controllers
- Server-rendered views with EJS
- Tailwind CSS styling
- Sample data seeding via script
- Public by default — no user auth yet
- A **demo user** exists for future implementation of authentication (already linked in DB). Currently, this user’s data is **visible to everyone**.

---

## 📁 Project Structure

```
.
├── app.js
├── controllers/
├── db/
├── middlewares/
├── public/
├── routes/
├── tests/
├── views/
├── notes/
└── ...
```

---

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (via \`pg\`)
- **Templating**: EJS
- **Styling**: Tailwind CSS
- **Testing**: Node.js + custom test file
- **Dev Tools**: dotenv, nodemon

---

## Entities & Relationships

- **Goals**: A user-defined objective. Can be assigned to multiple tasks.
- **Tasks**: Individual units of work. Each task can belong to one goal and many tags.
- **Tags**: Labels for organizing tasks. Many-to-many relation with tasks.
- **User**: Currently just a placeholder \`demo\` user in the DB.

Relational structure:

```
User ---< Goals
User ---< Tasks >---< Tags
```

---

## Running Locally

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd inventory
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up PostgreSQL

Create a PostgreSQL DB and update your `.env`:

```
DB_USER=your_username
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=inventory
```

### 4. Create Tables

```bash
node db/addTables.js
```

### 5. Seed Data

```bash
node db/populatedb.js
```

### 6. Start the server

```bash
npm start
```

---

## Deployment

To deploy:

1. Create a production PostgreSQL DB (like Railway or Supabase)
2. Update \`.env\` with production DB creds
3. Seed your production DB with the same scripts
4. Use any Node-compatible host (like Render, Vercel with server functions)

---

## Future Plans

- [ ] Add full **user authentication**
- [ ] Prevent users from accessing others’ data
- [ ] Allow only authenticated users to create/edit/delete
- [ ] Protect destructive actions via **admin confirmation**
- [ ] Make it prettier with better Tailwind layout
- [ ] Separate UI logic with React and deliver db with express API

---

## Author

Made with ❤️ by Sahil  
Built as part of [The Odin Project](https://www.theodinproject.com) curriculum.

---

## License

MIT — free to use and modify.
