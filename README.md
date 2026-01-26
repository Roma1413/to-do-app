# To-Do List Web Application

A simple and beautiful web application to manage your daily tasks. Create, view, edit, and delete your to-do items with ease!

## What This Project Does

This is a full-stack web application that lets you:
- Create new to-do items with a title, description, priority level, and status
- View all your to-do items in a nice card layout
- Edit existing to-do items
- Delete to-do items you no longer need
- See your tasks organized by priority (High, Medium, Low) with color coding

## What You Need Before Starting

Before you can run this project, make sure you have:
1. **Node.js** installed on your computer (version 14 or higher)
2. **MongoDB** account - either:
   - A free MongoDB Atlas account (cloud database), OR
   - MongoDB installed locally on your computer
3. A code editor like VS Code (optional but helpful)

## How to Set Up the Project

### Step 1: Get Your MongoDB Connection String

If you're using MongoDB Atlas (recommended for beginners):
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account
2. Create a new cluster (the free tier is fine)
3. Create a database user (remember the username and password!)
4. Add your IP address to the whitelist (or use 0.0.0.0/0 to allow all IPs for testing)
5. Click "Connect" and choose "Connect your application"
6. Copy the connection string - it will look like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

### Step 2: Configure the Backend

1. Open the `backend` folder
2. Create a new file called `.env` (make sure it starts with a dot!)
3. Add this line to the `.env` file (replace with your actual connection string):
   ```
   MONGODB_URL=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/tododb?retryWrites=true&w=majority
   PORT=5000
   ```
   **Important:** Replace `your-username` and `your-password` with your actual MongoDB username and password. Also replace the cluster URL with yours.

### Step 3: Install Dependencies

Open a terminal/command prompt in the project folder and run:

```bash
cd backend
npm install
```

This will download all the necessary packages the project needs to run.

### Step 4: Start the Server

While still in the `backend` folder, run:

```bash
npm start
```

Or if you have nodemon installed:

```bash
nodemon Server.js
```

You should see messages like:
- "Connected to MongoDB"
- "Server is running on port 5000"

If you see any errors, check:
- Is your `.env` file in the `backend` folder?
- Is your MongoDB connection string correct?
- Are all dependencies installed?

### Step 5: Open the Application

Once the server is running:
1. Open your web browser
2. Go to: `http://localhost:5000`
3. You should see the To-Do List application!

## How to Use the Application

### Creating a New To-Do

1. Fill in the form at the top:
   - **Title**: Give your task a name (required)
   - **Description**: Add details about what needs to be done (required)
   - **Priority**: Choose Low, Medium, or High (required)
   - **Status**: Choose Pending, In Progress, or Completed (optional, defaults to Pending)
2. Click "Create To-Do"
3. Your new task will appear in the list below!

### Editing a To-Do

1. Find the to-do item you want to edit
2. Click the "Edit" button
3. The form will fill with the current information
4. Make your changes
5. Click "Update To-Do"
6. Your changes will be saved!

### Deleting a To-Do

1. Find the to-do item you want to delete
2. Click the "Delete" button
3. Confirm that you want to delete it
4. The item will be removed from your list

### Refreshing the List

If you want to reload all to-do items, click the "Refresh" button in the top right of the to-do list section.

## Project Structure

Here's what each folder and file does:

```
TO-DO WEB/
├── backend/              # Server-side code
│   ├── controllers/      # Handles the logic for each operation
│   │   └── ToDoController.js
│   ├── models/           # Defines the data structure
│   │   └── ToDoModel.js
│   ├── routes/           # Defines the API endpoints
│   │   └── ToDoRoute.js
│   ├── Server.js         # Main server file
│   └── package.json      # Project dependencies
│
└── frontend/             # Client-side code (what users see)
    ├── index.html        # The webpage structure
    ├── styles.css        # The design and colors
    └── app.js            # Makes everything interactive
```

## API Endpoints

The backend provides these API endpoints (you can test them with Postman):

- `GET /api/todos` - Get all to-do items
- `GET /api/todos/:id` - Get a single to-do item by ID
- `POST /api/todos` - Create a new to-do item
- `PUT /api/todos/:id` - Update an existing to-do item
- `DELETE /api/todos/:id` - Delete a to-do item

## Troubleshooting

### Server won't start
- Check if port 5000 is already in use
- Make sure all dependencies are installed (`npm install`)
- Verify your `.env` file exists and has the correct MongoDB URL

### Can't connect to MongoDB
- Double-check your connection string in the `.env` file
- Make sure your IP address is whitelisted in MongoDB Atlas
- Verify your username and password are correct

### Frontend not loading
- Make sure the server is running
- Check the browser console for errors (F12)
- Verify you're going to `http://localhost:5000`

### Can't create or edit to-dos
- Check that all required fields are filled (Title, Description, Priority)
- Look at the browser console for error messages
- Make sure the server is still running

## Technologies Used

- **Backend**: Node.js, Express.js, MongoDB (via Mongoose)
- **Frontend**: HTML, CSS, JavaScript (vanilla, no frameworks)
- **Database**: MongoDB


