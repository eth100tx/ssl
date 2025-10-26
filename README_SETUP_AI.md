# AI Setup Instructions - Railway Next.js MVP

This document contains instructions for AI assistants to verify and set up the Railway environment before beginning application development.

## Critical Pre-Development Checklist

**YOU MUST COMPLETE AND VERIFY ALL STEPS BELOW BEFORE WRITING ANY APPLICATION CODE.**

### Step 1: Verify Railway CLI Installation and Authentication

```bash
# Check Railway CLI is installed
railway --version

# Check authentication status
railway whoami
```

**Expected Result**: Should show Railway CLI version and logged-in user email.

**If Failed**:
- CLI not installed: User needs to install from https://docs.railway.com/guides/cli
- Not authenticated: User needs to run `railway login`

### Step 2: Verify Railway MCP Server

Use the MCP tool to check Railway status:

```
mcp__Railway__check-railway-status
```

**Expected Result**: Should confirm Railway CLI is installed and user is logged in.

**If Failed**: Stop and ask user to complete authentication.

### Step 3: Verify Git Repository Setup

```bash
# Check if git is initialized
git status

# Check remote repository
git remote -v
```

**Expected Result**:
- Git repository initialized
- Remote origin pointing to GitHub repository

**If Failed**:
```bash
# Initialize git if needed (this is allowed as it's already initialized based on env)
git status

# User needs to create GitHub repo and add remote if not present
# Example: git remote add origin git@github.com:username/railway_demo.git
```

### Step 4: Verify Railway Project Exists and is Linked

```bash
# Check current project status
railway status
```

**Expected Result**: Should show:
- Project name
- Environment (usually "production")
- Service (if already created)

**If Failed - No Project**: Create and link project:
```
Use MCP tool: mcp__Railway__create-project-and-link
Parameters:
- projectName: "railway_demo"
- workspacePath: "/home/eric/p2/railway_demo"
```

**If Failed - Not Linked**: Link to existing project:
```bash
railway link
```

### Step 5: Verify MySQL Database Service

```bash
# List all services in the project
railway service list
```

**Expected Result**: Should show a MySQL service in the list.

**If Failed - No MySQL Service**:
Use Railway dashboard or CLI to add MySQL:
```bash
# Via CLI - link the project first, then:
railway add --database mysql
```

Or use MCP to deploy MySQL template:
```
Use MCP tool: mcp__Railway__deploy-template
Parameters:
- searchQuery: "mysql"
- workspacePath: "/home/eric/p2/railway_demo"
```

### Step 6: Verify DATABASE_URL Environment Variable

```bash
# Check environment variables
railway variables
```

**Expected Result**: Should show `DATABASE_URL` variable with MySQL connection string format:
`mysql://user:password@host:port/database`

**If Failed**:
- If MySQL service exists but no DATABASE_URL: Check service configuration
- DATABASE_URL should be automatically added when MySQL service is provisioned
- May need to reference the MySQL service variable

### Step 7: Verify Project Can Connect to Railway

```bash
# Test deployment capability (dry run)
railway status --json
```

**Expected Result**: Valid JSON output with project details.

### Step 8: Initialize Database Table

Once MySQL service is confirmed, create the tasks table:

**Option A - Via Railway CLI**:
```bash
# Connect to Railway MySQL
railway run mysql -h <host> -u <user> -p<password> <database> < scripts/init.sql
```

**Option B - Via Railway Dashboard**:
- Open Railway dashboard
- Navigate to MySQL service
- Use Query tab to run:
```sql
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Note**: This step may be deferred until after app code is written, but verify MySQL service is accessible.

---

## Complete Verification Checklist

Before proceeding to application development, verify:

- [ ] Railway CLI installed (version shown)
- [ ] Railway authenticated (whoami shows email)
- [ ] Railway MCP server working
- [ ] Git repository initialized
- [ ] GitHub remote configured
- [ ] Railway project created
- [ ] Project linked to local directory
- [ ] MySQL service added to Railway project
- [ ] DATABASE_URL environment variable exists
- [ ] Can run `railway status` successfully

---

## What to Do After Verification

Once ALL checklist items are verified:

1. **Create `.gitignore`** file
2. **Initialize Next.js project** with TypeScript and Tailwind
3. **Install dependencies** (next, react, mysql2, etc.)
4. **Create database connection utility** (`lib/db.ts`)
5. **Build API routes** (`app/api/tasks/`)
6. **Create frontend UI** (`app/page.tsx`)
7. **Test locally** with Railway MySQL
8. **Deploy to Railway**
9. **Run database initialization** if not done yet
10. **Generate public domain**
11. **Test production deployment**

---

## Emergency Troubleshooting

**Problem**: `railway` command not found
- Solution: User needs to install Railway CLI

**Problem**: Not logged in to Railway
- Solution: User needs to run `railway login`

**Problem**: No project linked
- Solution: Run `railway link` or create new project

**Problem**: MySQL service missing
- Solution: Add MySQL via `railway add` or Railway dashboard

**Problem**: DATABASE_URL not set
- Solution: Check MySQL service is fully provisioned; may need to wait or manually configure

**Problem**: Cannot connect to database
- Solution: Verify DATABASE_URL format, check MySQL service status in Railway dashboard

---

## Ready to Start Development?

**ONLY proceed with app development after confirming:**

✅ All verification steps completed successfully
✅ No errors in any verification commands
✅ DATABASE_URL is accessible and valid
✅ Git and GitHub are properly configured
✅ Railway project and MySQL service are operational

**IF ANY STEP FAILS**: Stop and resolve the issue before continuing. Do not write application code until infrastructure is 100% verified.
