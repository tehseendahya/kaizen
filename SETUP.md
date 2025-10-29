# Axis - Setup Guide

## Getting Started

This is a Next.js application for learning CS201 with an AI tutor (Gary the Penguin 🐧).

### Prerequisites

- Node.js 18+ installed
- A Google Gemini API key (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd kaizen
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your API key**

   Create a `.env.local` file in the root directory:
   ```bash
   touch .env.local
   ```

   Add your Google Gemini API key:
   ```env
   # Google Gemini API Configuration
   GOOGLE_API_KEY=your_api_key_here

   # Gemini Model Selection
   GEMINI_MODEL=gemini-2.0-flash-lite
   ```

4. **Get a Google Gemini API Key**

   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Click "Get API Key"
   - Create a new key or use an existing one
   - Copy the key and paste it into your `.env.local` file

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the app.

### For Deployment (Vercel, Netlify, etc.)

When deploying to a hosting platform:

1. Add the environment variables in your platform's settings:
   - `GOOGLE_API_KEY` - Your Gemini API key
   - `GEMINI_MODEL` - `gemini-2.0-flash-lite` (or your preferred model)

2. **Do NOT** commit your `.env.local` file to git (it's already in `.gitignore`)

### Troubleshooting

**API Error 500**: Make sure your `.env.local` file exists and has a valid `GOOGLE_API_KEY`.

**Gary not responding**: Check the browser console and terminal for error messages. The API key might be missing or invalid.

**Different computers**: Each person needs to create their own `.env.local` file with their own API key.

### Features

- ✅ CS201 course content (10 units, 30+ sub-units)
- ✅ Interactive quizzes with instant feedback
- ✅ AI tutor (Gary) powered by Google Gemini
- ✅ Markdown rendering with math support
- ✅ Responsive design

### Tech Stack

- **Framework**: Next.js 15.5 (App Router)
- **Styling**: Tailwind CSS 4
- **AI**: Google Gemini API
- **Language**: TypeScript
- **Markdown**: react-markdown + KaTeX for math

---

Made with ❤️ for CS201 students

