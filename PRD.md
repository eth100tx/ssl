# Product Requirements Document (PRD)
## Next.js + MySQL MVP on Railway

### Project Overview

A minimal viable product demonstrating a full-stack Next.js application with MySQL database, deployed to Railway. The application is a simple task manager that demonstrates CRUD operations, API design, and full-stack deployment.

### Vision

Build the simplest possible production-ready application that proves all layers of a modern web stack work together: frontend, backend API, database, and cloud deployment.

---

## Core Features

### 1. Task Management System
A single "tasks" entity with basic CRUD operations.

**Task Data Model**:
- `id` (integer, primary key, auto-increment)
- `title` (string, required, max 255 characters)
- `completed` (boolean, default false)
- `created_at` (timestamp, auto-set to current time)

### 2. RESTful API Endpoints

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| GET | `/api/tasks` | List all tasks | None | `{ tasks: Task[] }` |
| POST | `/api/tasks` | Create new task | `{ title: string }` | `{ id: number, title: string, completed: false, created_at: string }` |
| PATCH | `/api/tasks/[id]` | Toggle task completion | None (toggles current state) | `{ id: number, title: string, completed: boolean, created_at: string }` |
| DELETE | `/api/tasks/[id]` | Delete a task | None | `{ success: true }` |

### 3. User Interface

**Single Page Application**:
- Task list displayed in a clean, readable format
- Inline toggle to mark tasks complete/incomplete
- Input field to add new tasks
- Delete button for each task
- Responsive design that works on desktop and mobile
- Minimal, professional styling with Tailwind CSS

**User Interactions**:
1. User enters task title in input field
2. User clicks "Add Task" or presses Enter
3. Task appears in list
4. User can click task to toggle completion (visual strikethrough)
5. User can delete task by clicking delete button
6. Page refreshes data from server on load and after each action

### 4. Database

**Technology**: MySQL hosted on Railway

**Tables**: Single `tasks` table

**Schema**:
```sql
CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. Deployment

**Platform**: Railway

**Deployment Method**: Git-based (automatic on push to main)

**Infrastructure Requirements**:
- Next.js application service
- MySQL database service
- Environment variable injection (DATABASE_URL)
- Public domain access

---

## Technical Requirements

### Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend Framework** | Next.js 14 (App Router) | Modern, full-stack capable, TypeScript support |
| **UI Styling** | Tailwind CSS | Utility-first, minimal setup, responsive by default |
| **Language** | TypeScript | Type safety, better developer experience |
| **Database Driver** | mysql2/promise | Lightweight, no ORM overhead, direct SQL control |
| **HTTP Client** | Fetch API (native) | Built-in, no external dependencies |
| **Hosting** | Railway | Simple deployment, automatic MySQL provisioning |

### No External Dependencies
- ❌ No ORM (Prisma, TypeORM, Sequelize)
- ❌ No state management library (Redux, Zustand)
- ❌ No form library (React Hook Form)
- ❌ No API client library (axios, SWR)
- ❌ No UI component library (Material-UI, shadcn/ui)

All of the above are deliberately excluded to keep the MVP as simple as possible.

### Environment Variables

**Local Development** (`.env.local`):
```
DATABASE_URL=mysql://user:password@localhost:3306/database_name
```

**Production** (Railway):
- Automatically provided by MySQL service
- No manual configuration needed

---

## Success Criteria

### Functional Acceptance Criteria

- ✅ User can view a list of all tasks on the home page
- ✅ User can create a new task with a title
- ✅ User can see the task appear in the list immediately after creation
- ✅ User can toggle a task's completion status by clicking it
- ✅ User can delete a task
- ✅ Completed tasks show visual indication (strikethrough, muted color)
- ✅ All data persists in MySQL database
- ✅ Application loads in under 3 seconds
- ✅ API responds with proper HTTP status codes (200, 201, 400, 404, 500)

### Non-Functional Acceptance Criteria

- ✅ Code is TypeScript (type-safe)
- ✅ No console errors or warnings
- ✅ Mobile responsive (works on phones and tablets)
- ✅ Accessible (semantic HTML, alt text)
- ✅ Application deploys successfully to Railway
- ✅ Production database is initialized and accessible
- ✅ Public domain is generated and accessible
- ✅ Application works in production (not just local)

### Out of Scope (Phase 2+)

- ❌ User authentication/accounts
- ❌ Multiple users/lists
- ❌ Task editing
- ❌ Filtering/sorting
- ❌ Drag-and-drop reordering
- ❌ Notifications
- ❌ Dark mode
- ❌ Database migrations tooling
- ❌ Advanced error handling
- ❌ Analytics
- ❌ Testing (unit/integration)

---

## Project Phases

### Phase 1: Project Setup
**Objective**: Initialize project skeleton with dependencies

- Initialize Next.js 14 with TypeScript and Tailwind CSS
- Install mysql2 package
- Create `.gitignore`
- Set up `.env.local` template
- Create folder structure

**Deliverable**: Project that runs locally with `npm run dev`

### Phase 2: Database Setup
**Objective**: Connect to MySQL and create schema

- Create `lib/db.ts` - MySQL connection pool utility
- Create `scripts/init.sql` - Database initialization script
- Test local database connection
- Document connection setup for Railway

**Deliverable**: Verified database connection and tasks table

### Phase 3: Backend API
**Objective**: Build RESTful API endpoints

- Create `app/api/tasks/route.ts` (GET all, POST create)
- Create `app/api/tasks/[id]/route.ts` (PATCH toggle, DELETE)
- Implement raw SQL queries
- Add error handling and validation
- Test all endpoints with curl/Postman

**Deliverable**: Working API endpoints with data persistence

### Phase 4: Frontend UI
**Objective**: Build user interface

- Create `app/layout.tsx` (root layout with Tailwind setup)
- Create `app/page.tsx` (main page component)
- Build task list display
- Build task form (add new task)
- Add inline delete buttons
- Style with Tailwind CSS

**Deliverable**: Functional web interface

### Phase 5: Local Testing
**Objective**: Verify all features work locally

- Test create task
- Test view tasks
- Test toggle completion
- Test delete task
- Test page refresh (data persists)
- Verify no console errors

**Deliverable**: Fully functional local application

### Phase 6: Railway Deployment
**Objective**: Deploy to production

- Ensure Railway project and MySQL service exist
- Set `DATABASE_URL` environment variable
- Deploy application via git push
- Run database initialization on Railway database
- Generate public domain
- Test production application with public URL

**Deliverable**: Live application accessible at public Railway domain

### Phase 7: Production Testing
**Objective**: Verify production functionality

- Test all CRUD operations on live site
- Verify data persists across requests
- Check response times
- Verify error handling
- Document public URL

**Deliverable**: Verified production application

---

## File Structure

```
railway_demo/
├── app/
│   ├── api/
│   │   └── tasks/
│   │       ├── route.ts           # GET /api/tasks, POST /api/tasks
│   │       └── [id]/
│   │           └── route.ts       # PATCH /api/tasks/[id], DELETE /api/tasks/[id]
│   ├── layout.tsx                 # Root layout with Tailwind setup
│   ├── page.tsx                   # Home page with task list and form
│   ├── globals.css                # Tailwind CSS imports
│   ├── page.module.css            # Page-specific styles (if needed)
│   └── favicon.ico
├── lib/
│   └── db.ts                      # MySQL connection pool and utilities
├── scripts/
│   └── init.sql                   # Database initialization script
├── public/                        # Static assets (if any)
├── .gitignore                     # Git ignore rules
├── .env.local                     # Local environment variables (not committed)
├── .env.example                   # Template for environment variables
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript configuration
├── next.config.mjs                # Next.js configuration
├── tailwind.config.ts             # Tailwind CSS configuration
├── postcss.config.js              # PostCSS configuration
├── README.md                       # Project documentation
├── README_SETUP_AI.md             # AI setup verification guide
└── PRD.md                         # This file
```

---

## Database Design

### Tasks Table

```sql
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns**:
- `id`: Unique identifier for each task (auto-incrementing)
- `title`: Task description (required, up to 255 characters)
- `completed`: Whether task is done (false by default)
- `created_at`: When task was created (auto-set to current time)

**Indexes**: Primary key (id) is automatically indexed

**No Relations**: Single table, no foreign keys (MVP simplicity)

---

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Buy groceries",
    "completed": false,
    "created_at": "2024-10-26T12:00:00Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Task not found",
  "status": 404
}
```

### List Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Buy groceries",
      "completed": false,
      "created_at": "2024-10-26T12:00:00Z"
    },
    {
      "id": 2,
      "title": "Read book",
      "completed": true,
      "created_at": "2024-10-26T11:00:00Z"
    }
  ]
}
```

---

## Environment Setup

### Local Development

**File**: `.env.local` (not committed to git)

```env
# MySQL connection string for local development
DATABASE_URL=mysql://root:password@localhost:3306/tasks_db
```

### Production (Railway)

**Automatically Provided by Railway MySQL Service**:
- `DATABASE_URL` environment variable is automatically injected
- Format: `mysql://user:password@host:port/database`
- No manual configuration needed

---

## Constraints & Assumptions

### Constraints
- Single table, no complex relationships
- No user authentication
- No data validation beyond type checking
- No rate limiting
- No caching
- Synchronous operations (no async tasks)

### Assumptions
- Railway MySQL service is pre-configured
- `DATABASE_URL` environment variable is available
- User will manually create tasks table on Railway database
- Development uses local MySQL database
- Git and GitHub are already set up

---

## Acceptance Testing Plan

### Manual Testing Checklist

#### CREATE Functionality
- [ ] User can type task title in input field
- [ ] User can submit task with Enter key
- [ ] User can submit task with button click
- [ ] New task appears in list immediately
- [ ] Task ID is assigned automatically
- [ ] Task created_at timestamp is set
- [ ] Task completed is set to false
- [ ] Input field clears after submission
- [ ] Cannot create task with empty title

#### READ Functionality
- [ ] All tasks are displayed on page load
- [ ] Tasks are ordered by creation date (newest first or oldest first - consistent)
- [ ] Each task displays title, status, and delete button
- [ ] Page loads quickly (< 3 seconds)
- [ ] Refreshing page shows all tasks
- [ ] Completed tasks are visually distinct

#### UPDATE Functionality
- [ ] User can click task to toggle completion
- [ ] Completed task shows strikethrough or muted styling
- [ ] Task is updated in database
- [ ] Page refresh preserves completed status
- [ ] Can toggle back to incomplete

#### DELETE Functionality
- [ ] User can click delete button on task
- [ ] Task disappears from list immediately
- [ ] Task is removed from database
- [ ] Cannot retrieve deleted task
- [ ] List updates correctly after deletion

#### Production Testing
- [ ] All CRUD operations work on live Railway URL
- [ ] Data persists across page refreshes
- [ ] API responds with correct HTTP status codes
- [ ] No console errors in browser
- [ ] No database connection errors
- [ ] Mobile responsive design works

---

## Deployment Checklist

- [ ] All code committed to git
- [ ] Git tag `dev_start` exists
- [ ] `.env.local` is in `.gitignore` (not committed)
- [ ] Railway project is linked
- [ ] MySQL service is added to Railway
- [ ] `DATABASE_URL` is set in Railway environment
- [ ] Next.js build succeeds locally (`npm run build`)
- [ ] Database initialization script is in `scripts/init.sql`
- [ ] Railway detects Next.js project automatically
- [ ] Deployment completes without errors
- [ ] Application starts on Railway
- [ ] Public domain is generated
- [ ] Application is accessible via public URL
- [ ] All CRUD operations work in production

---

## Notes for Implementation

1. **Keep it simple**: Every line of code added should directly serve a user-visible feature
2. **Raw SQL**: Use direct SQL queries without an ORM - easier to understand and debug
3. **Type safety**: Use TypeScript for all code - provides safety and documentation
4. **Error handling**: Simple try/catch blocks, return meaningful error messages
5. **No over-engineering**: Don't build for future requirements, only current MVP
6. **Testing approach**: Manual testing via browser and API testing tool; no automated tests

---

## Acceptance Criteria Summary

The MVP is **complete and successful** when:

✅ **Local Development**: Application runs locally with `npm run dev`, connects to local MySQL, and all CRUD operations work
✅ **Production Deployment**: Application deploys to Railway, connects to Railway MySQL, generates public URL
✅ **Functionality**: User can create, view, toggle, and delete tasks with data persisting across sessions
✅ **UI/UX**: Clean, responsive interface that works on desktop and mobile
✅ **Code Quality**: TypeScript types, error handling, readable code structure
✅ **Documentation**: README and setup guide are clear and accurate

The application does not need: authentication, multiple users, advanced features, or production monitoring.

---

## Success Looks Like

After completion, the user should be able to:

1. Visit a public Railway URL
2. See a list of tasks
3. Add a new task
4. Toggle task completion
5. Delete a task
6. Refresh the page and see all changes persisted

All without any technical errors or console warnings.
