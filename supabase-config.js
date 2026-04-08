// ============================================================
// 📦 supabase-config.js — Supabase Connection Setup
// ============================================================
// This file creates and exports a Supabase "client" object.
// Think of a client as a messenger that talks to your database
// on your behalf — it handles all the network requests for you.
//
// 🔑 You need TWO things from your Supabase project dashboard:
//   1. Project URL  — the address of your database
//   2. Anon Key     — a public key that identifies your app
//
// HOW TO FIND THESE:
//   1. Go to https://supabase.com → sign in → open your project
//   2. Click "Project Settings" (gear icon) → "API"
//   3. Copy the "Project URL" and "anon / public" key
// ============================================================

// 🔗 Replace these with YOUR Supabase project credentials
const SUPABASE_URL = "https://vmnmkgnjzujkteqcbxmk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtbm1rZ25qenVqa3RlcWNieG1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NTk1NDksImV4cCI6MjA5MTIzNTU0OX0.sGyLNCn7GI99wSrYpjZo4liiQXfhR7X2oCwqKNyrp3w";

// 🏗️ Create the Supabase client using the CDN library
// The `supabase` global is available because we included the
// Supabase JS CDN script in index.html (loaded before this file)
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ✅ Log a confirmation so we know the config loaded
console.log("✅ Supabase client initialized successfully!");
