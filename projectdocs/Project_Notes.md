# Project Notes

## Project Overview
- **Purpose**: An alternative to productivity tools like Trello and Notion, focusing on task management and collaboration.

## Key Features
1. **Task Management**: Users can create, organize, and track tasks with tags and @user mentions.
2. **Collaboration Tools**: Features include comments, notifications, and real-time updates.
3. **Customizable Workspaces**: Users can create personalized workspaces.
4. **Integration Capabilities**: Ability to integrate with third-party services.
5. **User-Friendly Interface**: Modern UI inspired by Notion and Apple Store.

## Supabase Features
- **Real-time subscriptions**: Listen for changes in the database.
- **Storage**: For file uploads (photos and documents).
- **Edge Functions**: Serverless functions for backend logic.
- **Row Level Security**: Fine-grained access control.

## Project Structure Ideas
### Frontend (Next.js) idea structure
```
/frontend
  ├── /components
  ├── /pages
  ├── /public
  ├── /styles
  ├── /utils
  ├── /hooks
  ├── /context
  └── /api
```



## API Endpoints
### Tasks
- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/tasks/:id`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`

### Users
- `GET /api/users`
- `POST /api/users`
- `GET /api/users/:id`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

## Testing Strategy
- A balanced approach with unit tests, integration tests, and end-to-end tests.

## Additional Notes
- **File Uploads**: Support for photos and documents.
- **Real-Time Collaboration**: Using Socket.IO for real-time features.
- **Dependencies**: Assess as we proceed; include Axios, Shadcn, and Supabase client library.
