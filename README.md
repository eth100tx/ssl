# Next.js + MySQL MVP on Railway

A simple task manager application built with Next.js 14 and MySQL, deployed on Railway.

## Prerequisites Verification

**IMPORTANT**: Before starting development, you MUST verify the environment is properly configured according to [README_SETUP_AI.md](./README_SETUP_AI.md).

### Required Setup Checklist
- [ ] Railway CLI installed and authenticated
- [ ] Railway MCP server configured
- [ ] GitHub repository created and connected
- [ ] Railway project created and linked to this directory
- [ ] MySQL database service added to Railway project
- [ ] DATABASE_URL environment variable configured
- [ ] Git repository initialized with remote origin

**Run this verification before proceeding with app development:**
```bash
# 1. Check Railway authentication
railway whoami

# 2. Verify project link
railway status

# 3. Verify MySQL service exists
railway service list

# 4. Check environment variables
railway variables

# 5. Verify git remote
git remote -v
```

All checks must pass before starting app development.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: MySQL (via mysql2 package)
- **Styling**: Tailwind CSS
- **Deployment**: Railway

## Database Schema

```sql
CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Environment Variables

Create `.env.local` for local development:
```
DATABASE_URL=mysql://user:password@host:port/database
```

For Railway deployment, `DATABASE_URL` will be automatically provided by the MySQL service.

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

Deployment to Railway is automatic via git push:

```bash
git add .
git commit -m "Deploy to Railway"
git push origin main
```

Railway will automatically build and deploy the application.

## Features

- Create tasks
- View all tasks
- Toggle task completion status
- Delete tasks
- Responsive UI with Tailwind CSS

## API Endpoints

- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create new task (body: `{ title: string }`)
- `PATCH /api/tasks/[id]` - Toggle task completed status
- `DELETE /api/tasks/[id]` - Delete task

## Project Structure

```
railway_demo/
├── app/
│   ├── api/tasks/          # API routes
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main page
├── lib/
│   └── db.ts               # MySQL connection
├── scripts/
│   └── init.sql            # Database initialization
├── .env.local              # Local environment variables
└── package.json
```
