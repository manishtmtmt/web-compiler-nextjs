# Web Compiler with Real-Time Preview

## Overview

A web-based code compiler application that allows users to write, preview, and save code snippets in HTML, CSS, and JavaScript with real-time preview functionality. The application features authentication, theme toggling, and snippet sharing capabilities.

## Features

- **Multi-language Support**: Write code in HTML, CSS, and JavaScript
- **Real-time Preview**: See changes instantly as you type
- **Responsive Layout**:
  - Toggle preview screen between full screen and half screen
- **Theme Options**:
  - Light and dark mode toggle
- **Authentication**:
  - Clerk-based authentication (Email, Google)
  - Login and sign-up pages
- **Code Snippet Management**:
  - Save code snippets (authenticated users only)
  - View saved snippets
  - Share snippets with others
- **Debugging**:
  - View console messages from your JavaScript code
- **Persistence**:
  - LocalStorage for temporary storage
  - Database storage for saved snippets

## Tech Stack

- **Frontend**: Next.js, Tailwind CSS
- **Icons**: Lucide React
- **Code Editor**: Monaco-editor/react
- **Authentication**: Clerk.js
- **Database**: Prisma ORM with MongoDB

## Live Demo

[Click Here](https://mtweblab.vercel.app/)

## Setup Instructions

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- MongoDB Atlas account (or local MongoDB instance)
- Clerk account

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/manishtmtmt/web-compiler-nextjs
   cd web-compiler-nextjs
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**:
   - Create a `.env` file in the root directory
   - Add the following environment variables:
     ```
     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
     CLERK_SECRET_KEY=your_clerk_secret_key
     NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
     NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
     NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
     NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
     CLERK_WEBHOOK_SIGNING_SECRET=your_clerk_webhook_secret_key
     
     DATABASE_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/dbname?retryWrites=true&w=majority
     ```

4. **Clerk Setup**:
   - Create an account at [Clerk.dev](https://clerk.dev)
   - Create a new application and get your publishable and secret keys
   - Configure the allowed redirect URLs in your Clerk dashboard
   - Create a new webhook url and get your webhook secret key

5. **Database Setup**:
   - Set up a MongoDB Atlas cluster or use a local MongoDB instance
   - Update the `DATABASE_URL` in your `.env` file with your connection string

6. **Database Migration**:
   ```bash
   npx prisma db push
   # or
   yarn prisma db push
   ```

7. **Run the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

8. **Open the application**:
   Visit `http://localhost:3000` in your browser


## Project Structure

```
web-compiler/
├── app/                                  # Next.js 15+ App Router directory
│ ├── (landing)/                          # Landing page group (optional route group)
│ │ ├── snippets/                         # Snippet-related pages
│ │ │ └── [id]/                           # Dynamic route for individual snippets
│ │ │ └── page.tsx                        # Single snippet view page
│ │ ├── page.tsx                          # Main landing page
│ │ └── layout.tsx                        # Layout specific to landing pages
│ │
│ ├── api/                                # API routes directory
│ │ ├── snippets/                         # Snippet-related API endpoints
│ │ │ ├── [id]/                           # Dynamic route for single snippet operations
│ │ │ │ └── route.ts                      # Handle GET/PUT/DELETE for specific snippet
│ │ │ └── route.ts                        # Handle POST (create) and GET (list) snippets
│ │ └── webhooks/                         # Webhook endpoints
│ │ └── clerk/                            # Clerk-specific webhooks
│ │ └── route.ts                          # Handle Clerk webhook events
│ │
│ ├── components/                         # Reusable components
│ │ ├── CodeEditor.tsx                    # Monaco editor wrapper component
│ │ ├── FullScreenToggle/                 # Fullscreen toggle UI component
│ │ ├── Header.tsx                        # Main navigation header
│ │ ├── LanguageSelector.tsx              # Language selection component
│ │ ├── PreviewPane.tsx                   # Live preview iframe component
│ │ ├── ResizablePanel.tsx                # Resizable split-panel component
│ │ └── ThemeToggle.tsx                   # Light/dark mode toggle
│ │
│ ├── lib/                                # Utility/library files
│ │ ├── constants.ts                      # Application constants
│ │ └── prisma.ts                         # Prisma client initialization
│ │
│ ├── provider/                           # Context providers
│ │ └── theme-provider.tsx                # Theme context provider
│ │
│ ├── sign-in/                            # Sign-in page
│ │ └── [[...sign-in]]/                   # Catch-all route for sign-in variations
│ │ └── page.tsx                          # Sign-in page component
│ │
│ ├── sign-up/                            # Sign-up page
│ │ └── [[...sign-up]]/                   # Catch-all route for sign-up variations
│ │ └── page.tsx                          # Sign-up page component
│ │
│ ├── global.css                          # Global CSS styles
│ └── layout.tsx                          # Root layout for the application
│
├── public/                               # Static assets
│ ├── images/                             # Image assets
│ └── favicon.ico                         # Favicon
│
├── .env                                  # Environment variables
├── .env.example                          # Environment variables template
├── .gitignore                            # Git ignore rules
├── middleware.ts                         # Next.js middleware
├── next.config.js                        # Next.js configuration
├── package.json                          # Project dependencies
├── package-lock.json                     # Lock file
├── postcss.config.js                     # PostCSS configuration
├── README.md                             # Project documentation
└── tsconfig.json                         # TypeScript configuration
```

## Key File Descriptions

### App Router Files
- `app/layout.tsx` - Root layout that wraps all pages
- `app/page.tsx` - Home page (when not using route groups)
- `app/(landing)/page.tsx` - Landing page when using route groups
- `app/api/` - API route handlers for backend functionality
- `app/sign-in/[[...sign-in]]/page.tsx` - Dynamic sign-in page that handles all sign-in variants
- `app/sign-up/[[...sign-up]]/page.tsx` - Dynamic sign-up page that handles all sign-up variants

### Component Files
- `CodeEditor.tsx` - Wrapper for Monaco editor with language support
- `PreviewPane.tsx` - Iframe-based live preview component
- `ResizablePanel.tsx` - Handles the resizable split between editor and preview
- `ThemeToggle.tsx` - Implements light/dark mode switching

### Utility Files
- `lib/prisma.ts` - Initializes and exports the Prisma client
- `lib/constants.ts` - Contains app-wide constants (themes, languages, etc.)
- `provider/theme-provider.tsx` - Context provider for theme management

### Configuration Files
- `middleware.ts` - Handles authentication middleware (Clerk integration)
- `next.config.js` - Next.js custom configuration
- `tailwind.config.js` - Tailwind CSS customization
- `postcss.config.js` - PostCSS plugins configuration

### Important Patterns
1. **Route Groups**: `(landing)` demonstrates how to group related routes
2. **Dynamic Routes**: `[id]` and `[...slug]` patterns for flexible routing
3. **API Routes**: Organized by resource type (snippets, webhooks)
4. **Parallel Routes**: Potential for future expansion with `@` directories
5. **Intercepting Routes**: Could be added for modal dialogs

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.

## License

[Specify your license here, e.g., MIT]

## Acknowledgements

- Next.js team
- Clerk for authentication
- Monaco Editor team
- Prisma team
- Tailwind CSS team

## 👨‍💻 Meet the Creator
Hey! I'm Manish Tiwari, a passionate developer building cool tools for coders.

🔗 Connect with me:

- [GitHub](https://github.com/manishtmtmt) (⭐ Star my projects!)

- [LinkedIn](https://linkedin.com/in/wdmanisht)

## 🙌 Support This Project
If you find this tool useful, please consider:

1. ⭐ Starring the repo (helps more developers discover it)

2. 🐛 Reporting issues (I love feedback!)

3. 💬 Sharing with your network