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
- Many `task` <-> many `tags`
- Tasks can exist without goals, but not without users
- Tasks and tags can exist without each others
- Tag doesn't need a user directly

---

## Routes Schema

```txt
`/`                 -> One index route. Kind of like a home page
                       It will show a sidebar with options for categories and tags for filter
                       It will also show all the tasks
`/profile`          -> Inside Header. It will have link to user profile
`/goals`            -> Show all categories
`/goals/:goalId`    -> Show specific category info and its related tasks
`/tags`             -> Show all tags
`/tags/:tagId`      -> Show specific tag indo and its related details
`/tasks/:taskId`    -> Show task details
`/?goal=1&tag=3`    -> Query for filtering tasks on home page
                       There can be just one query or can be more than one
                       There can also be a sort method for added_date and due-date
                       There will also be a filter of is_completed
```

The query logic can be in a separate utility function because the query can be made from many routes, like, `/?goals=...&tags=...&sort=...`, `/goals/goalId/?tags=...&sort=...`, `/tags/tagId/?goal=...&sort=...`

---

## Page Schema

### Global Layout

- **Header**

  - Logo (linked to `/`)
  - Link to `/profile`

- **Footer**
  - Copyright doCraft
  - Link to GitHun

### `/` - Home Route

- **Sidebar**

  - Multi-select filter for:
    - Goals
    - Tags
  - Filter for:
    - Tasks due before a specific date
    - Sort by `added_date` or `due_date` (asc/desc)

- **Main Area**
  - Displays all tasks (filtered if URL query is present)
  - `Add Task` button → navigates to task creation form (`/tasks/new`)
  - Task delete options present here

### `/profile` - Profile Route

- Shows demo user profile
- Includes header and footer
- No sidebar

### `/goals` - Goals List

- Lists all user goals
- `Add Goal` mini form (inline)
- Option to delete any goal
- Includes header and footer
- No sidebar

### `/goals/:goalId` - Single Goal View

- Displays detailed info for the goal
- Lists all tasks under this goal
- Sidebar includes:
  - Tag filters
  - Due-before filter
  - Sort options
- Goal filter becomes **single-select links**
- Option to edit goal
- Header and footer present

### `/tags` - Tags List

- Lists all user tags
- `Add Tag` mini form (inline)
- Option to delete any tag
- Includes header and footer
- No sidebar

### `/tags/:tagId` - Single Tag View

- Displays detailed info for the tag
- Lists all tasks under this tag
- Sidebar includes:
  - Goal filters
  - Due-before filter
  - Sort options
- Tag filter becomes **single-select links**
- Option to edit tag
- Header and footer present

### `/tasks/:taskId` - Task Details

- Shows full details of a task
- `Edit Task` button opens the same form as creation, pre-filled
- Task can be deleted here too

### Task Delete Behavior

- Tasks can be deleted from:
  - `/`
  - `/goals/:goalId`
  - `/tags/:tagId`
  - `/tasks/:taskId`

---

---

## 18-07-2025

### Current tree

```bash
.
├── app.js
├── ca_base64.txt
├── ca.pem
├── controllers
│   ├── goalsController.js
│   ├── indexController.js
│   ├── index.js
│   ├── profileController.js
│   ├── tagsController.js
│   └── tasksController.js
├── db
│   ├── addTables.js
│   └── populatedb.js
├── middlewares
│   └── setCurrentUser.js
├── notes
│   └── NOTES.md
├── package.json
├── package-lock.json
├── public
│   ├── goal.css
│   ├── goals.css
│   ├── index.css
│   ├── profile.css
│   ├── tag.css
│   ├── tags.css
│   └── task.css
├── README.md
├── routes
│   ├── 404Router.js
│   ├── goalsRouter.js
│   ├── index.js
│   ├── indexRouter.js
│   ├── profileRouter.js
│   ├── tagsRouter.js
│   └── tasksRouter.js
├── utils
└── views
    ├── footer.ejs
    ├── goal.ejs
    ├── goals.ejs
    ├── header.ejs
    ├── index.ejs
    ├── profile.ejs
    ├── sidebar.ejs
    ├── tag.ejs
    ├── tags.ejs
    └── task.ejs

8 directories, 40 files
```

## 19-07-2025

- I started with setup of `routes` and `controllers`.
- And I am done with showing tasks on `/` route (without the filters and sorting, mind you.)
- Added a form for storing new task.

I can now kind of see why building an app alone can be really time consuming.  
On top of all these if we not go the Monolithic route and go `React+Express` with Express server providing us API endpoints, things can get really messy really fast!

> If you are reading this, Hope you are doing well!

### Current tree

```bash
.
├── app.js
├── ca_base64.txt
├── ca.pem
├── controllers
│   ├── goalController.js
│   ├── goalsController.js
│   ├── indexController.js
│   ├── index.js
│   ├── profileController.js
│   ├── tagController.js
│   ├── tagsController.js
│   ├── taskFormController.js
│   └── tasksController.js
├── db
│   ├── addTables.js
│   ├── pool.js
│   ├── populatedb.js
│   └── queries.js
├── middlewares
│   └── setCurrentUser.js
├── notes
│   └── NOTES.md
├── package.json
├── package-lock.json
├── public
│   ├── goal.css
│   ├── goals.css
│   ├── index.css
│   ├── profile.css
│   ├── tag.css
│   ├── tags.css
│   └── task.css
├── README.md
├── routes
│   ├── 404Router.js
│   ├── goalsRouter.js
│   ├── index.js
│   ├── indexRouter.js
│   ├── profileRouter.js
│   ├── tagsRouter.js
│   └── tasksRouter.js
├── tests
│   └── buildTaskQuery.test.js
├── utils
│   └── buildTaskQuery.js
└── views
    ├── goals
    │   ├── detail.ejs
    │   └── list.ejs
    ├── index.ejs
    ├── partials
    │   ├── footer.ejs
    │   ├── header.ejs
    │   └── sidebar.ejs
    ├── profile.ejs
    ├── tags
    │   ├── detail.ejs
    │   └── list.ejs
    └── tasks
        ├── form.ejs
        └── view.ejs

13 directories, 48 files
```

## 05-08-2025

I need to form a habit of commiting.  
Just completed and commited. There is still one thing left - adding error page. for now i am just showing it as `console.error()`. I think i will add this in next update when i add authentication. Oh and connecting this with Aiven database.

I think i also blundered in middle by commiting keys and such but later have to revert to last commit and that kind of took some progress away.

> Note to self: Learn Git properly.

I also had some problem with successfully configuring Tailwind with express and ejs. This article helped me.
(Medium Article)[https://medium.com/@hannnirin/setting-up-express-mvc-ejs-tailwindcss-4-0-2ccac72dad59]

### Current Tree

```bash
.
├── app.js
├── controllers
│   ├── goalDetailController.js
│   ├── goalFormController.js
│   ├── goalsListController.js
│   ├── indexController.js
│   ├── index.js
│   ├── profileController.js
│   ├── tagDetailController.js
│   ├── tagFormController.js
│   ├── tagsListController.js
│   ├── taskFormController.js
│   └── tasksController.js
├── db
│   ├── addTables.js
│   ├── pool.js
│   ├── populatedb.js
│   └── queries.js
├── middlewares
│   └── setCurrentUser.js
├── notes
│   └── NOTES.md
├── package.json
├── package-lock.json
├── postcss.config.js
├── public
│   ├── styles
│   │   ├── build.css
│   │   └── styles.css
│   └── utils
│       ├── buildTaskQuery.js
│       └── sidebarFormHandler.js
├── README.md
├── routes
│   ├── 404Router.js
│   ├── goalsRouter.js
│   ├── index.js
│   ├── indexRouter.js
│   ├── profileRouter.js
│   ├── tagsRouter.js
│   └── tasksRouter.js
├── tailwind.config.js
├── tests
│   └── buildTaskQuery.test.js
└── views
    ├── goals
    │   ├── detail.ejs
    │   ├── form.ejs
    │   └── list.ejs
    ├── index.ejs
    ├── layout
    │   ├── noSidebarLayout.ejs
    │   └── sidebarLayout.ejs
    ├── messageOnly.ejs
    ├── partials
    │   ├── footer.ejs
    │   ├── header.ejs
    │   └── sidebar.ejs
    ├── profile.ejs
    ├── tags
    │   ├── detail.ejs
    │   ├── form.ejs
    │   └── list.ejs
    └── tasks
        ├── card.ejs
        ├── form.ejs
        └── view.ejs

15 directories, 52 files
```

### What I want with this project

I am thinking of continuing this project instead of making new ones. Like instead of making `Project: Members Only` or `Project: Blog API` to learn Authentication and API, i will integrate them with this project. I will keep that idea on shelf.

Another thing i want to add is better distinction of tasks, like priority wise.  
Oh and adding recurring task functionality. That would be cool. Also to handle errors gracefully, maybe something like `flash errors`.  
Not pagination, don't think that's needed.
