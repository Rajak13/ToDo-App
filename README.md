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
git clone <>
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

## Environment Setup

The application requires the following environment variables:

```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Schema

The Supabase database uses the following schema for todos:

```sql
CREATE TABLE todos (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);


ALTER TABLE todos DISABLE ROW LEVEL SECURITY;
```

## Contributing

This project was created as part of an internship program. Feel free to fork and modify for your own learning purposes.

## License

MIT License - feel free to use this project for learning and development purposes.
