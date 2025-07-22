# Base Project Setup

## Create project directory
```bash
mkdir link-shortener
cd link-shortener
mkdir nodejs
cd nodejs
```

## Initialize npm project
```bash
npm init -y
```

## Install main dependencies
```bash
npm install express prisma @prisma/client cors helmet
npm install -D typescript @types/node @types/express @types/cors tsx nodemon eslint prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

## Initialize TypeScript config
```bash
npx tsc --init
```

# Configure TypeScript
Replace your `tsconfig.json` with this optimized configuration:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

# Configure Scripts
Add these scripts to your `package.json`:
```json
{
  "scripts": {
    "dev": "cross-env NODE_ENV=development nodemon --exec tsx src/index.ts",
    "dev:win": "set NODE_ENV=development && nodemon --exec tsx src/index.ts",
    "dev:unix": "NODE_ENV=development nodemon --exec tsx src/index.ts",
    "build": "tsc",
    "start": "cross-env NODE_ENV=production node dist/index.js",
    "start:win": "set NODE_ENV=production && node dist/index.js",
    "start:unix": "NODE_ENV=production node dist/index.js",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "format": "prettier --write src/**/*.ts",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

# Setup Database Schema

## Create Schema:
Create `prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model Link {
  id          String   @id @default(cuid())
  originalUrl String   @map("original_url")
  shortCode   String   @unique @map("short_code")
  clicks      Int      @default(0)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("links")
}

```

## Run database setup:
```bash
npx prisma db push
npx prisma generate
```

# WebStorm Configurations

Step 8: WebStorm Configuration
In WebStorm:

Open your project folder
WebStorm should automatically detect TypeScript configuration
Go to Settings → Languages & Frameworks → Node.js and set interpreter to your Node.js installation
For debugging, create a run configuration:

### Method 1:
Go to Run → Edit Configurations

Click `+` → `Node.js`

Set Name to `Debug via tsx (CJS)`

Set Working directory to `your project root`

Set JavaScript file to `node_modules\tsx\dist\cli.cjs`

Set Application parameters to `src/index.ts`

### Method 2:
Go to Run → Edit Configurations

Click `+` → `Node.js`

Set Name to `Debug via tsx loader`

Set TypeScript Loader to `Boundled (tsx)`

Set Working directory to `your project root`

Set JavaScript file to `src\index.ts`


# Running the Application

Migrations
```bash
# Stop your dev server first

# Reset the database (this will delete all data)
npm run db:reset

# Or if you want to keep data, just push the schema changes
npm run db:push

# Regenerate the Prisma client
npm run db:generate
```

Development mode (auto-restarts on changes)
```bash
npm run dev
```

## Build for production
```bash
npm run build
```

## Run production build
```bash
npm start
```

## View database in browser
```bash
npm run db:studio
```

# Run Details

## Testing Your Application

Start the dev server: npm run dev
Visit http://localhost:3000
Enter a URL to shorten
Test the redirect by visiting the short URL
Check analytics at http://localhost:3000/api/analytics/YOUR_SHORT_CODE

## Key Features Implemented

URL Shortening: POST /api/shorten
URL Redirect: GET /:shortCode
Analytics: GET /api/analytics/:shortCode
List Links: GET /api/links
Click Tracking: Automatic increment on redirect
Duplicate Prevention: Returns existing short code for same URL
Simple Web Interface: Clean, responsive design

## Debugging Tips

Use console.log() for basic debugging
WebStorm has excellent debugging support - set breakpoints and use the debugger
Check browser console for frontend errors
Use npm run db:studio to view database contents
API endpoints return JSON for easy testing with tools like Postman