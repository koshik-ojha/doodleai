# AI Chatbot Dashboard - UI Structure

## Overview
This document outlines the new dashboard and UI components created for the AI Chatbot application. The chatbot is designed to handle website-related questions and collect user information through forms embedded in the chat interface.

## Dashboard Pages

### 1. **Dashboard Home** (`/dashboard`)
- Overview statistics (Total Chats, Active Users, Form Submissions, Response Rate)
- Recent activity feed
- Quick actions panel
- Popular questions display

### 2. **Conversations** (`/dashboard/conversations`)
- List all chatbot conversations
- Search and filter functionality
- Conversation status (active, resolved, pending)
- View conversation details
- Export conversations

### 3. **Form Submissions** (`/dashboard/submissions`)
- Display all form submissions from the chatbot
- Contact information (name, email, phone, company)
- Submission status tracking
- Detailed view modal
- Export to CSV functionality

### 4. **Analytics** (`/dashboard/analytics`)
- Performance metrics
- User activity charts
- Top questions tracking
- Response categories breakdown
- Time-based insights

### 5. **Users** (`/dashboard/users`)
- User management interface
- Role-based access (Admin, Moderator, User)
- User status tracking
- Activity monitoring
- Search and filter users

### 6. **Integration** (`/dashboard/integration`)
- Website embed code
- Widget configuration options
- Live widget preview
- Installation instructions
- Customization settings

### 7. **Settings** (`/dashboard/settings`)
- Profile settings
- Notification preferences
- Chatbot configuration (welcome message, response delay, language)
- Appearance customization (theme, accent colors)
- Security settings (2FA, session timeout)

## Key Components

### `DashboardLayout.jsx`
- Main dashboard wrapper
- Collapsible sidebar navigation
- Header with user profile
- Responsive design

### `ChatbotForm.jsx`
- Reusable form component
- Contact form fields (name, email, phone, company, subject, message)
- Success state with animation
- Integrates with chatbot conversations

### `ChatWidget.jsx`
- Embeddable chat widget for websites
- Floating button trigger
- Quick action buttons
- Form integration
- Minimizable interface

### `QuickReplies.jsx`
- Pre-defined quick reply buttons
- Categorized responses
- Form triggers
- Enhances user experience

## Features

### Current Implementation
- ✅ Complete dashboard UI with all pages
- ✅ Responsive design for all screen sizes
- ✅ Dark theme with consistent styling
- ✅ Form submission collection
- ✅ Conversation management
- ✅ User management interface
- ✅ Analytics visualization
- ✅ Website integration tools
- ✅ Settings configuration
- ✅ Embeddable chat widget

### Placeholder Data
All pages currently use placeholder/mock data. These will need to be connected to the backend API:
- Statistics and metrics
- User conversations
- Form submissions
- User data
- Analytics data

## Next Steps (Backend Integration)

1. **API Endpoints Needed:**
   - `GET /api/dashboard/stats` - Dashboard statistics
   - `GET /api/conversations` - Fetch all conversations
   - `POST /api/forms/submit` - Submit contact form
   - `GET /api/forms` - Get form submissions
   - `GET /api/analytics` - Analytics data
   - `GET /api/users` - User management
   - `PUT /api/settings` - Update settings

2. **Database Models:**
   - Form submissions (name, email, phone, company, subject, message, status, timestamp)
   - Conversation metadata (user, topic, status, last_updated)
   - User roles and permissions
   - Analytics tracking

3. **Real-time Features:**
   - Live chat updates using WebSockets
   - Real-time notification system
   - Active user tracking

## Usage

### Accessing the Dashboard
1. Navigate to `/dashboard` after logging in
2. Use the sidebar to navigate between different sections
3. Click on items to view details or take actions

### Embedding the Widget
1. Go to Integration page (`/dashboard/integration`)
2. Copy the embed code
3. Paste before `</body>` tag on your website
4. Customize widget settings as needed

### Managing Forms
1. Forms are triggered automatically in chat when users express interest in contact
2. View all submissions in Form Submissions page
3. Track submission status (new, reviewed, contacted)
4. Export data for CRM integration

## Styling
- **Framework:** Tailwind CSS
- **Theme:** Dark mode (zinc color palette)
- **Primary Color:** Blue (#2563eb)
- **Icons:** Lucide React

## File Structure
```
frontend/
├── app/
│   ├── dashboard/
│   │   ├── page.js                 # Dashboard home
│   │   ├── conversations/page.js   # Conversations list
│   │   ├── submissions/page.js     # Form submissions
│   │   ├── analytics/page.js       # Analytics
│   │   ├── users/page.js           # User management
│   │   ├── integration/page.js     # Website integration
│   │   └── settings/page.js        # Settings
│   └── chat/
│       └── page.js                 # Existing chat page
├── components/
│   ├── DashboardLayout.jsx         # Dashboard wrapper
│   ├── ChatbotForm.jsx             # Form component
│   ├── ChatWidget.jsx              # Embeddable widget
│   ├── QuickReplies.jsx            # Quick reply buttons
│   ├── ChatWindow.jsx              # Existing chat window
│   ├── Sidebar.jsx                 # Existing sidebar
│   └── AuthForm.jsx                # Existing auth form
```

## Notes
- All functional logic is placeholder - ready for backend integration
- UI is fully responsive and tested for various screen sizes
- Components are modular and reusable
- Follow existing patterns when adding backend functionality
