# React Todo App with Authentication

This Todo application is a modern, responsive task management system built with React and Supabase. It features a clean user interface with authentication and real-time data synchronization.

## Project Overview

The project demonstrates the implementation of a full-stack application using:
- React for the frontend
- Supabase as the backend database and authentication provider
- Modern UI/UX principles with a pink, black, and white theme

### Features

- 🔐 User authentication (sign up, sign in)
- 👤 User profile management with avatar uploads
- 🛡️ Row Level Security with proper data isolation
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
- React Icons for UI elements
- Supabase Storage for file uploads

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Supabase account (free tier works fine)

### Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Set up the necessary tables in your Supabase database:

```sql
-- Create todos table
CREATE TABLE todos (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for todos
CREATE POLICY "Users can view their own todos" 
ON todos FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own todos" 
ON todos FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own todos" 
ON todos FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todos" 
ON todos FOR DELETE USING (auth.uid() = user_id);

-- Create policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE USING (auth.uid() = id);

-- Set up storage
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can upload an avatar"
ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid() = owner
);
```

3. Create a storage bucket named `avatars` in your Supabase project

### Application Setup

1. Clone the repository:
```bash
git clone https://github.com/Rajak13/ToDo-App.git
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

## Usage

1. When you first visit the app, you'll be directed to the sign-in page
2. Create a new account via the "Sign Up" tab
3. After successful authentication, you can:
   - Create new todos
   - Mark todos as complete by checking them off
   - Edit or delete todos as needed
   - Update your profile information and avatar

## Authentication Features

- User registration with email confirmation
- Secure login with password protection
- Password visibility toggle for easier entry
- User profile management
- Avatar image uploads
- Role-based access control

## Contributing

This project was created as part of a development program. Feel free to fork and modify for your own learning purposes.

## License

MIT License - feel free to use this project for learning and development purposes.
