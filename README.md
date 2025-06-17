# React Todo App - Internship Day 1 Project

This Todo application was developed as part of the React internship program's first daily task. It's a modern, responsive todo management system built with React and Supabase, featuring a clean and intuitive user interface.

## Project Overview

The project demonstrates the implementation of a full-stack application using:
- React for the frontend
- Supabase as the backend database
- Modern UI/UX principles with a pink, black, and white theme

### Features

- ✨ Create, read, update, and delete todos
- 📝 Add optional descriptions to todos
- ✅ Mark todos as complete/incomplete
- 🎨 Modern and responsive design
- 🔄 Real-time updates using Supabase
- 📱 Mobile-friendly interface
- 🌙 Clean and intuitive user interface

## Technologies Used

- React 18
- Supabase (Backend as a Service)
- CSS3 with custom variables
- Lucide React for icons

## Getting Started

1. Clone the repository:
```bash
git clone <your-repo-url>
cd todo-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory and add your Supabase credentials:
```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm start
```

## Deployment Guide

You can deploy this application using various platforms. Here are the steps for some popular options:

### Deploying to Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy the application:
```bash
vercel
```

3. Follow the prompts to complete deployment.

### Deploying to Netlify

1. Create a `netlify.toml` file in the root directory:
```toml
[build]
  command = "npm run build"
  publish = "build"
```

2. Deploy using Netlify CLI or connect your GitHub repository through the Netlify dashboard.

### Deploying to GitHub Pages

1. Add homepage to package.json:
```json
{
  "homepage": "https://yourusername.github.io/todo-app"
}
```

2. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

3. Add deploy scripts to package.json:
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

4. Deploy:
```bash
npm run deploy
```

## Environment Setup

The application requires the following environment variables:

```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Schema

The Supabase database uses the following schema for todos:

```sql
todos (
  id: uuid (primary key)
  title: text (required)
  description: text
  completed: boolean
  created_at: timestamp with time zone
  user_id: uuid (foreign key to auth.users)
)
```

## Contributing

This project was created as part of an internship program. Feel free to fork and modify for your own learning purposes.

## License

MIT License - feel free to use this project for learning and development purposes.
