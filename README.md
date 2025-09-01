# doCraft App

A demo productivity and collaboration app built with **Node.js**, **Express**, **PostgreSQL**, and **Tailwind CSS**.  
It started as an **Inventory/Task Manager** but has expanded into a **Clubhouse** feature for rooms, discussions, and analytics.

> Built as part of an educational assignment for learning backend fundamentals with PostgreSQL and Express.

---

## ✨ Features

### Core Productivity

- Add, edit delete **tasks**, **goals**, and **tags**
- Associate tags and goals with tasks
- View detailed pages for each goal, task, or tag

### Clubhouse

- Browse all **rows** (public discussion spaces)
- Join/Unjoin rooms
- Create, edit, and delete rooms (with **owner/admin premissions**)
- Post messages inside rooms
- Room detial pages with real-time-style message display (scroll to latest)

### Profile & Analytics

- Personal **Profile Page** showing:
  - Your created **tasks**, **goals**, **tags**
  - Rooms you've joined
  - Messages you've posted (with room reference)
- Update username (non-guests only)
- **Guests** users can browse but not edit/join/create

### General

- Modular structure with routes and controllers
- Server-rendered views with EJS + TailwindCSS
- Error handling pages (`messageOnly` component)
- Sample data seeding via script

---

## 📁 Project Structure

```
.
├── app.js
├── ca_base64.txt
├── ca.pem
├── config                # passport.js configuration logic
├── controllers           # route logic
├── db                    # migrations + seeders + queries
├── middlewares           # auth + role checks
├── notes                 # dev notes & docs
├── package.json
├── package-lock.json
├── postcss.config.js
├── public                # static assets
├── README.md
├── routes                # route definitions
├── tailwind.config.js
├── tests
└── views                 # EJS templates

```

---

## ⚙️ Tech Stack

- **Backend**: Node.js, Express.js
- **Authentication**: Passport.js (Local Strategy)
- **Database**: PostgreSQL (via `pg`)
- **Templating**: EJS
- **Styling**: Tailwind CSS
- **Testing**: Node.js + custom test file
- **Dev Tools**: dotenv, nodemon, concurrently

---

## 🗃️ Entities & Relationships

### Users

- Can create multiple goals, tasks, rooms, and messages.
- Role based (`guest`,`user`,`admin`)
- Guests: restricted actions.

### Goals

- Belong to a user.
- Can have multiple tasks

### Tasks

- Belong to a goal(nullable) and a user.
- Many-to-many with tags

### Tags

- Independent labels
- Many-to-many with tasks

### Rooms

- Created by user (owner).
- Users can join multiple rooms.
- Owners/admins can delete/edit their rooms.

### Messages

- Belong to a user and a room
- Displayed in room detail pages

---

## 🚀 Running Locally

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

### 4. Create Tables and Seed data

```bash
node db/populatedb.js
node db/addTables.js
node db/clubTables.js
```

### 6. Start the server

```bash
npm run dev
```

---

## Deployment

To deploy:

1. Create a production PostgreSQL DB (like Railway or Supabase)
2. Update `.env` with production DB creds
3. Seed your production DB with the same scripts
4. Use any Node-compatible host (like Render, Vercel with server functions)

---

## Future Plans

- [x] Add full **user authentication**
- [x] Prevent users from accessing others’ data
- [x] Allow only authenticated users to create/edit/delete
- [ ] Protect destructive actions via **admin confirmation**
- [x] Make it prettier with better Tailwind layout
- [ ] React frontend + Express REST API backend
- [ ] Real-time updates with WebSockets (messages in rooms)
- [ ] Direct user-to-user messaging
- [ ] Infinite scroll / partial load for messages (like Discord)
- [ ] Improved analytics dashboard using charts.js
- [ ] Display tasks with better clarity.
- [ ] Add subtasks functionality

---

## Author

Made with ❤️ by Sahil  
Built as part of [The Odin Project](https://www.theodinproject.com) curriculum.

---

## License

MIT — free to use and modify.
