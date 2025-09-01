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

Also learn how to properly link database. Like I encountered problem while seeding the date. Node was rejecting the certificate and i had to seed the data without any certificate. Didn't get any answers at that time. Will try to look for it once more or ask on TOP Discord.

## 19-08-2025

Instead of creating a separate project to practice authentication, I’ll integrate a Clubhouse (community) feature directly into this app. A user system with a database already exists as a skeleton, so the main tasks are:

- Implementing routes for community features.
- Adding role-based logic (e.g., admin, member, demo).
- Rendering views selectively based on user roles.

This way, authentication and authorization will grow organically with the app instead of being handled in isolation.

## 20-08-2025

I am having some problem with understanding the flow for Authentication & Authorization. Let's revise it:

### Authentication & Authorization Flow

**1. User Registration**

- User submits `username` + `password`
- Server checks if username already exists.
- If unique:
  - Password is hashed with `bcryptjs`
  - New user is stored in `users` table with role = `user` (default)

**2. User Login**

- User submits `username` + `password`.
- Passport's `LocalStrategy` runs:
  - Look up user in `users` table by username
  - Compare submitted passrod with stored hash using `bcryptjs`
  - If valid -> return full user object.
- Passport stores only `user.id` in session (`serializeUser`).
- On each request, `deserializeUser` fetches the full user row -> available as `req.user`.

**3. Sessions**

- `express-session` + `connect-pg-simple` stores session in PostgreSQL.
- Session ID is stored in secure cookie.
- On each request, session middleware fethes user from DB if session exists.
- `req.user` and `res.locals.currentUser` are available in controllers/views.

**4. Authorization**

- Each user has a `role` column in the `users` table:
  - `"user"` -> normal user.
  - `"demo"` -> limited user (shared demo account).
  - `"admin"`-> elevated privileges.
- Middleware guards protected routes:
  - `ensureAuthenticated` -> only logged-in users can access.
  - `ensureAdmin` -> only admin role can access.
  - `restrictDemo` -> demo users can't create posts.

**5. Access Control**

- **Logged-in user** -> can manage their own goals, tasks, tags and see post authors.
- **Demo user** -> can use shared tasks/goals/tags but cannot post, and cannot see post authors.
- **Admin** -> can delete posts/comments and manage users.

I can now see why tests are important. My app was and is working but it's all false positives. The queries where not looking for any user specific data and were fetching all global data. There were no user restriction. All tags are global. So many problems and still, STILL the app worked. FALSE POSITIVE. Have to fix all those issues and integrate authentication after that. Then i have to add authorization too.

## 22-08-2025

I decided to make `tags` unique to `user`.

I following queries will add `user_id` column in tags, populating it with `demo` user id and setting and setting a constraint where `user_id` can't be `NULL`.

```bash
ALTER TABLE tags ADD COLUMN user_id INT REFERENCES users(id) ON DELETE CASCADE;

UPDATE tags SET user_id = 1 WHERE user_id IS NULL;

ALTER TABLE tags ALTER COLUMN user_id SET NOT NULL;
```

Previously, when we were inserting tags with:

```bash
INSERT INTO tags (name) VALUES ($1) ON CONFLICT (name) DO NOTHING;
```

If **any tag exists with the same `name`**, the insert is skipped. But this check was **global** across all users, because it only looks at he `name` column.  
So I checked for constraints existing on `tags` with `\d tags` and found

```bash
"tags_name_key" UNIQUE CONSTRAINT, btree (name)
```

We dropped that constraint with

```bash
ALTER TABLE tags DROP CONSTRAINT tags_name_key;
```

And created a per-user uniqueness:

```bash
CREATE UNIQUE INDEX unique_user_tag
ON tags (user_id, name);
```

It however gave error first when i tried to do

```bash
DROP INDEX IF EXISTS tags_name_key;

ERROR: cannot drop index tags_name_key because constraint tags_name_key on table tags requires it
HINT: You can drop constraint tags_name_key on table tags instead.
```

Kind of like telling that it isn't a standalone index I created but actually the backing index for a UNIQUE constraint that was auto-created when I first declared `name` as `UNIQUE`;

## 28-08-2025 / 29-08-2025

These last few days went in configuring passport-local for the project. How the flow will work and all. In addition, i have moved the `/` route to `/tasks` routes and now `/` route is a public page with no authentication required. Also i have added a middleware `ensureAuthenticated` to protect desired routes.

I am also adding `demo` user option so i am now reading `req.login` function and how does it fit in the flow of passport.

> `passport.authenticate()` middleware invokes `req.login()` automatically. This function is primarily used when users sign up, during which `req.login()` can be invoked to automatically log in the newly registered user.

### `/clubhouse` Flow

1. **Route Protection**

- All `/clubhouse` routes are protected with `ensureAuthenticated`
- Access depends on `req.user.role` (`guest`,`user`,`admin`)

2. **Role Capabilities**

- **Guest**
  - **Read-only**.
  - **Can only**:
    - Visit `/clubhouse`.
    - See messages **only** in `global` room.
    - View messages but **not authors** (display as "Anonymous").
  - **Cannot**:
    - Send messages.
    - Join/create/edit/delete rooms.
    - Delete any messages.
- **User**
  - **Standart member** with room ownership.
  - **Can**:
    - See **all rooms**
    - Join other rooms
    - Create new rooms (`/clubhouse/rooms/new`)
    - Edit or delete **their own rooms**
    - Send messages in **any room they've joined**
    - delete messages **only in their own rooms** (acts like a room admin)
    - See authors of all messages
  - **Cannot**
    - Delete rooms/messages they don't own
- **Admin**
  - **Superuser** privileges
  - Inherits all **user** abilities.
  - Extra powers:
    - Delete any message (even in `global`)
    - Delete any room
    - Moderate content platform-wide

3. **Routes Breakdown**

- **Rooms**

  - **GET /clubhouse/rooms** -> list all rooms

    - **Guest** -> only sees `global`.
    - **User** -> sees all rooms.
    - **Admin** -> sees all rooms.

  - **GET /clubhouse/rooms/new** -> form to create a new room

    - **User** ✅
    - **Admin** ✅
    - **Guest** ❌

  - **POST /clubhouse/rooms** -> submit new room

    - **User/Admin** ✅
    - **Guest** ❌

  - **GET /clubhouse/rooms/:roomId** -> view room

    - **Guest** -> only if `roomId = global` (no authors, no input box).
    - **User/Admin** -> full access (authors + message form).

  - **GET /clubhouse/rooms/:roomId/edit** -> edit room (title/description)

    - **User** -> only if they own the room.
    - **Admin** -> always.
    - **Guest** ❌

  - **POST /clubhouse/rooms/:roomId/delete** -> delete room
    - **User** -> only if they own the room.
    - **Admin** -> always.
    - **Guest** ❌

- **Messages**

  - **POST /clubhouse/rooms/:roomId/message/new** -> send a message

    - **Guest** ❌
    - **User** ✅ if joined room.
    - **Admin** ✅ in any room.

  - **POST /clubhouse/rooms/:roomId/message/:msgId/delete** -> delete message
    - **Guest** ❌
    - **User** ✅ if room belongs to them.
    - **Admin** ✅ always.

## 31-08-2025

### Implemented Features

- **Rooms List**

  - `GET /clubhouse/rooms`
  - Shows all available rooms.
  - Displays join/leave buttons depending on membership.
  - Sends `joinedRoomIds`, `userRole`, and `userId` to EJS for conditional UI.

- **Room Detail**

  - `GET /clubhouse/rooms/:roomId`
  - Displays room title, description, owner name, and messages.
  - Messages show author, timestamp, and delete button (if allowed).
  - Membership controls:
    - Guests → can only access `global` room.
    - Members → can leave room & send messages.
    - Non-members → can join room.
  - UI auto-scrolls to last message and auto-focuses textarea for members.

- **Join / Leave Room**

  - `POST /clubhouse/rooms/:roomId/join`
  - `POST /clubhouse/rooms/:roomId/leave`
  - Guards against redundant join/leave actions.
  - Restricts guest users (except `global`).

- **Messages**

  - `POST /clubhouse/rooms/:roomId/message/new` → create message (only if member).
  - `POST /clubhouse/rooms/:roomId/message/:msgId/delete` → delete message (if author, owner, or admin).

- **Room Management**
  - `GET /clubhouse/rooms/new` → create room form.
  - `POST /clubhouse/rooms/new` → create room.
  - `GET /clubhouse/rooms/:roomId/edit` → edit form (only admin/owner).
  - `POST /clubhouse/rooms/:roomId/edit` → update room.
  - `POST /clubhouse/rooms/:roomId/delete` → delete room (only admin/owner).

### Database Queries

- `findAllRooms()` → get all rooms.
- `findRoomById(roomId)` → fetch room details + owner username.
- `isUserMemberOfRoom({ userId, roomId })` → check membership.
- `addMembership({ userId, roomId })` → join a room.
- `removeMembership({ userId, roomId })` → leave a room.
- `newRoom({ title, description, ownerId })` → create room.
- `editRoom({ roomId, title, description })` → update room.
- `deleteRoom(roomId)` → delete room.
- `findMessageById(msgId)` → fetch message details.
- `newMessage({ content, authorId, roomId })` → create message.
- `deleteMessage(msgId)` → delete message.
- `getMessagesByRoom(roomId)` → fetch all messages of a room.
- `getUserRooms(userId)` → fetch all rooms joined by user.
- `findJoinedRoomIds(userId)` → fetch all room's id joined by user.

### EJS Views

- `roomsList.ejs` → show all rooms with join/leave UI.
- `roomDetail.ejs` → show room details, messages, and input form.
- `roomForm.ejs` → used for both create/edit room.

### Next Steps

- Add **flash messages** for join/leave/create/edit actions.
- Possibly add **search/filter** for rooms.
