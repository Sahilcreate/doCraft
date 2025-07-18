# Notes and Development Log

We have to create an Inventory managment app for an imaginary store. It's up to us what kind of business we chose - it can be about managing groceries, car parts, baby-toys, musical-instruments, ponies or anything!

It should include all of CRUD methods for all types of differentiation, i.e., categories, items, brand, etc..

## PostgreSQL database Schema

### `users` table

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT, -- placeholder for future auth
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `goals` table

```sql
CREATE TABLE goals (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title TEXT NOT NULL,
  description TEXT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

- Each goal belongs to a user (`user_id`)
- If the user is deleted, all their goals are deleted too (`ON DELETE CASCADE`)

### `tasks` table

```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title TEXT NOT NULL,
  description TEXT,
  goal_id INTEGER REFERENCES goals(id) ON DELETE SET NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT FALSE,
  due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

- Each task belongs to a user
- Task may belong to a goal(optional)
- If a **goal** is deleted, its tasks are preserved (`goal_id` becomes `NULL`)
- If a **user** is deleted, their tasks are removed (`ON DELETE CASCADE`)
- `is_completed` tracks task status

### `tags` table

```sql
CREATE TABLE tags (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT UNIQUE NOT NULL
);
```

### `task_tags` table

```sql
CREATE TABLE task_tags (
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, tag_id)
);
```

- Each `task` can have multiple `tags` and vice-versa
- `PRIMARY KEY (task_id, tag_id)` prevent duplicate task-tag connection

### Relationships Summary:

- One `user` -> many `goals` and `tasks`
- One `goal` -> many `tasks`
- Tasks can exist without goals, but not without users

## 18-07-2025

### Current tree

```bash
.
├── app.js
├── controllers
├── db
│   └── populatedb.js
├── notes
│   └── NOTES.md
├── package.json
├── package-lock.json
├── public
├── README.md
├── routes
└── views
```
