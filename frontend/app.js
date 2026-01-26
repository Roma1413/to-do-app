// API Base URL
const API_BASE_URL = 'http://localhost:5000/api/todos';

// DOM Elements
const todoForm = document.getElementById('todo-form');
const todosContainer = document.getElementById('todos-container');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');
const refreshBtn = document.getElementById('refresh-btn');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const formTitle = document.getElementById('form-title');

let editingTodoId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadTodos();
    
    todoForm.addEventListener('submit', handleFormSubmit);
    refreshBtn.addEventListener('click', loadTodos);
    cancelBtn.addEventListener('click', cancelEdit);
});

// Load all todos
async function loadTodos() {
    try {
        showLoading(true);
        hideError();
        
        const response = await fetch(API_BASE_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const todos = await response.json();
        displayTodos(todos);
    } catch (error) {
        showError('Failed to load todos: ' + error.message);
        todosContainer.innerHTML = '';
    } finally {
        showLoading(false);
    }
}

// Display todos
function displayTodos(todos) {
    if (todos.length === 0) {
        todosContainer.innerHTML = `
            <div class="empty-state">
                <h3>📭 No todos yet</h3>
                <p>Create your first to-do item above!</p>
            </div>
        `;
        return;
    }

    todosContainer.innerHTML = todos.map(todo => createTodoCard(todo)).join('');
    
    // Add event listeners to buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => editTodo(btn.dataset.id));
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => deleteTodo(btn.dataset.id));
    });
}

// Create todo card HTML
function createTodoCard(todo) {
    const createdDate = new Date(todo.createdAt).toLocaleDateString();
    const updatedDate = new Date(todo.updatedAt).toLocaleDateString();
    const isCompleted = todo.status === 'Completed';
    
    return `
        <div class="todo-card ${todo.priority.toLowerCase()}-priority ${isCompleted ? 'completed' : ''}">
            <div class="todo-header">
                <div>
                    <div class="todo-title">${escapeHtml(todo.title)}</div>
                </div>
            </div>
            <div class="todo-description">${escapeHtml(todo.description)}</div>
            <div class="todo-meta">
                <span class="priority-badge ${todo.priority.toLowerCase()}">Priority: ${todo.priority}</span>
                <span class="status-badge ${todo.status.toLowerCase().replace(' ', '-')}">Status: ${todo.status}</span>
                <span style="color: #999; font-size: 0.85rem;">Created: ${createdDate}</span>
                ${updatedDate !== createdDate ? `<span style="color: #999; font-size: 0.85rem;">Updated: ${updatedDate}</span>` : ''}
            </div>
            <div class="todo-actions">
                <button class="btn-edit" data-id="${todo._id}">✏️ Edit</button>
                <button class="btn-delete" data-id="${todo._id}">🗑️ Delete</button>
            </div>
        </div>
    `;
}

// Handle form submit
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
        title: document.getElementById('title').value.trim(),
        description: document.getElementById('description').value.trim(),
        priority: document.getElementById('priority').value,
        status: document.getElementById('status').value
    };
    
    // Validation
    if (!formData.title || !formData.description) {
        showError('Please fill in all required fields');
        return;
    }
    
    try {
        hideError();
        
        if (editingTodoId) {
            // Update existing todo
            await updateTodo(editingTodoId, formData);
        } else {
            // Create new todo
            await createTodo(formData);
        }
        
        // Reset form
        todoForm.reset();
        cancelEdit();
        loadTodos();
    } catch (error) {
        showError('Failed to save todo: ' + error.message);
    }
}

// Create new todo
async function createTodo(todoData) {
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(todoData)
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create todo');
    }
    
    return await response.json();
}

// Update todo
async function updateTodo(id, todoData) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(todoData)
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update todo');
    }
    
    return await response.json();
}

// Delete todo
async function deleteTodo(id) {
    if (!confirm('Are you sure you want to delete this todo?')) {
        return;
    }
    
    try {
        hideError();
        
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete todo');
        }
        
        loadTodos();
    } catch (error) {
        showError('Failed to delete todo: ' + error.message);
    }
}

// Edit todo
async function editTodo(id) {
    try {
        hideError();
        
        const response = await fetch(`${API_BASE_URL}/${id}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch todo');
        }
        
        const todo = await response.json();
        
        // Populate form
        document.getElementById('title').value = todo.title;
        document.getElementById('description').value = todo.description;
        document.getElementById('priority').value = todo.priority;
        document.getElementById('status').value = todo.status;
        
        // Update UI
        editingTodoId = id;
        formTitle.textContent = 'Edit To-Do';
        submitBtn.textContent = 'Update To-Do';
        cancelBtn.style.display = 'block';
        
        // Scroll to form
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        showError('Failed to load todo for editing: ' + error.message);
    }
}

// Cancel edit
function cancelEdit() {
    editingTodoId = null;
    formTitle.textContent = 'Create New To-Do';
    submitBtn.textContent = 'Create To-Do';
    cancelBtn.style.display = 'none';
    todoForm.reset();
}

// Utility functions
function showLoading(show) {
    loading.style.display = show ? 'block' : 'none';
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
}

function hideError() {
    errorMessage.classList.remove('show');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

