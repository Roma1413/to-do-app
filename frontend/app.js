// API URLs - Automatically detects environment
// For production: Update BACKEND_URL below with your Render backend URL
// For development: Uses localhost automatically
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const BACKEND_URL = isDevelopment 
    ? 'http://localhost:5000' 
    : 'https://todo-backend.onrender.com'; // ⚠️ UPDATE THIS with your Render backend URL

const API = {
    auth: `${BACKEND_URL}/api/auth`,
    todos: `${BACKEND_URL}/api/todos`,
    categories: `${BACKEND_URL}/api/categories`
};

// State
let token = localStorage.getItem('token');
let user = JSON.parse(localStorage.getItem('user') || 'null');
let isLoginMode = true;
let editingTodoId = null;
let editingCategoryId = null;
let isSubmittingCategory = false;
let allTodos = []; // Store all todos globally
let allCategories = []; // Store all categories globally
let expandedCategoryId = null; // Track which category is expanded

// DOM Elements
const authButtons = document.getElementById('auth-buttons');
const userInfo = document.getElementById('user-info');
const userEmail = document.getElementById('user-email');
const logoutBtn = document.getElementById('logout-btn');
const authModal = document.getElementById('auth-modal');
const modalTitle = document.getElementById('modal-title');
const authForm = document.getElementById('auth-form');
const roleField = document.getElementById('role-field');
const authSubmit = document.getElementById('auth-submit');
const closeModal = document.querySelector('.close');
const categoriesSection = document.getElementById('categories-section');
const todoFormSection = document.getElementById('todo-form-section');
const welcomeSection = document.getElementById('welcome-section');
const todosSection = document.getElementById('todos-section');
const todoForm = document.getElementById('todo-form');
const categorySelect = document.getElementById('category');
const todosList = document.getElementById('todos-list');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('login-btn').onclick = () => showAuthModal(true);
    document.getElementById('register-btn').onclick = () => showAuthModal(false);
    logoutBtn.onclick = logout;
    closeModal.onclick = () => authModal.style.display = 'none';
    authForm.onsubmit = handleAuth;
    todoForm.onsubmit = handleTodoSubmit;
    document.getElementById('refresh-btn').onclick = () => {
        loadCategories();
        loadTodos();
    };
    document.getElementById('cancel-btn').onclick = cancelEdit;
    
    // Category form - attach to button directly (only once)
    const createCategoryBtn = document.getElementById('create-category-btn');
    if (createCategoryBtn) {
        // Remove any existing listeners first
        const newBtn = createCategoryBtn.cloneNode(true);
        createCategoryBtn.parentNode.replaceChild(newBtn, createCategoryBtn);
        
        // Attach listener to the new button
        document.getElementById('create-category-btn').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Create Category button clicked!');
            handleCategorySubmit();
        });
        console.log('Create Category button listener attached');
    }
    
    // Also attach to form submit (prevent double submission)
    const categoryForm = document.getElementById('category-form');
    if (categoryForm) {
        // Remove existing listeners
        const newForm = categoryForm.cloneNode(true);
        categoryForm.parentNode.replaceChild(newForm, categoryForm);
        
        document.getElementById('category-form').addEventListener('submit', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Category form submit event');
            handleCategorySubmit();
        });
    }
    
    window.onclick = (e) => {
        if (e.target === authModal) authModal.style.display = 'none';
    };
}

// Auth Functions
function checkAuth() {
    if (token && user) {
        showAuthenticatedUI();
        loadCategories();
        loadTodos();
    } else {
        showUnauthenticatedUI();
    }
}

function showAuthModal(login) {
    isLoginMode = login;
    modalTitle.textContent = login ? 'Login' : 'Register';
    authSubmit.textContent = login ? 'Login' : 'Register';
    authModal.style.display = 'block';
    authForm.reset();
}

async function handleAuth(e) {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;

    try {
        const endpoint = isLoginMode ? '/login' : '/register';
        const body = { email, password };

        const res = await fetch(API.auth + endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        token = data.token;
        user = data.user;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        authModal.style.display = 'none';
        showAuthenticatedUI();
        loadCategories();
        loadTodos(); // Load todos to update counts
    } catch (error) {
        showError(error.message);
    }
}

function logout() {
    token = null;
    user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showUnauthenticatedUI();
}

function showAuthenticatedUI() {
    authButtons.style.display = 'none';
    userInfo.style.display = 'block';
    userEmail.textContent = user.email;
    welcomeSection.style.display = 'none';
    todosSection.style.display = 'none'; // Hide todos section - todos shown in categories
    categoriesSection.style.display = 'block';
    todoFormSection.style.display = 'block';
    
    // Re-attach category button listener when UI becomes visible
    setTimeout(() => {
        const createCategoryBtn = document.getElementById('create-category-btn');
        if (createCategoryBtn) {
            createCategoryBtn.addEventListener('click', () => {
                console.log('Create Category button clicked! (re-attached)');
                handleCategorySubmit();
            });
            console.log('Create Category button listener re-attached in showAuthenticatedUI');
        }
    }, 100);
}

function showUnauthenticatedUI() {
    authButtons.style.display = 'block';
    userInfo.style.display = 'none';
    welcomeSection.style.display = 'block';
    todosSection.style.display = 'none';
    categoriesSection.style.display = 'none';
    todoFormSection.style.display = 'none';
    todosList.innerHTML = '';
}

// Category Functions
async function loadCategories() {
    if (!token) return;
    
    try {
        console.log('Loading categories...');
        const res = await fetch(API.categories, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to load categories');
        }
        const categories = await res.json();
        console.log('Loaded categories:', categories);
        console.log('Number of categories:', categories.length);
        displayCategories(categories);
        populateCategorySelect(categories);
    } catch (error) {
        console.error('Error loading categories:', error);
        showError('Failed to load categories: ' + error.message);
    }
}

function displayCategories(categories) {
    allCategories = categories; // Store globally
    const list = document.getElementById('categories-list');
    if (categories.length === 0) {
        list.innerHTML = '<p class="empty-message">No categories yet. Create your first category group above!</p>';
        return;
    }
    
    list.innerHTML = '<h3 style="margin-bottom: 15px;">Your Category Groups (Click to view todos):</h3>' + categories.map(cat => {
        const todosInCategory = allTodos.filter(todo => 
            (todo.category?._id || todo.category) === cat._id
        );
        const isExpanded = expandedCategoryId === cat._id;
        const catColor = cat.color || '#667eea';
        
        return `
        <div class="category-card expandable" style="border-left-color: ${catColor}">
            <div class="category-header" onclick="toggleCategory('${cat._id}')" style="cursor: pointer;">
                <div>
                    <h3>📁 ${escapeHtml(cat.name)} 
                        <span class="todo-count">(${todosInCategory.length} ${todosInCategory.length === 1 ? 'todo' : 'todos'})</span>
                    </h3>
                    <p>${escapeHtml(cat.description)}</p>
                </div>
                <span class="expand-icon">${isExpanded ? '▼' : '▶'}</span>
            </div>
            
            ${isExpanded ? `
            <div class="category-content">
                <!-- Search Box -->
                <div class="search-box">
                    <input type="text" 
                           id="search-${cat._id}" 
                           class="search-input" 
                           placeholder="🔍 Search todos in this category..."
                           oninput="filterTodosInCategory('${cat._id}', this.value)">
                </div>
                
                <!-- Todos List -->
                <div id="todos-${cat._id}" class="todos-in-category">
                    ${displayTodosForCategory(cat._id, todosInCategory)}
                </div>
                
                <!-- Add Todo Button -->
                <button class="btn-primary" onclick="createTodoInCategory('${cat._id}', '${escapeHtml(cat.name)}')" style="margin-top: 15px;">
                    + Add Todo to This Category
                </button>
            </div>
            ` : ''}
            
            <div class="category-actions">
                <button class="btn-edit" onclick="editCategory('${cat._id}')">✏️ Edit</button>
                <button class="btn-delete" onclick="deleteCategory('${cat._id}')">🗑️ Delete</button>
            </div>
        </div>
        `;
    }).join('');
}

function populateCategorySelect(categories) {
    if (categories.length === 0) {
        categorySelect.innerHTML = '<option value="">No categories yet - create one above!</option>';
        categorySelect.disabled = true;
    } else {
        categorySelect.disabled = false;
        categorySelect.innerHTML = '<option value="">Select a category...</option>' + categories.map(cat => 
            `<option value="${cat._id}">${escapeHtml(cat.name)}</option>`
        ).join('');
    }
}

async function handleCategorySubmit(e) {
    // Prevent multiple simultaneous submissions
    if (isSubmittingCategory) {
        console.log('Category submission already in progress, ignoring...');
        return;
    }
    
    console.log('=== handleCategorySubmit called ===');
    
    if (!token) {
        showError('Please login to create categories');
        return;
    }
    
    isSubmittingCategory = true;

    const nameInput = document.getElementById('category-name');
    const descriptionInput = document.getElementById('category-description');
    const colorInput = document.getElementById('category-color');
    
    if (!nameInput || !descriptionInput) {
        console.error('Category form inputs not found!', { nameInput: !!nameInput, descriptionInput: !!descriptionInput });
        showError('Form inputs not found. Please refresh the page.');
        isSubmittingCategory = false;
        return;
    }

    const name = nameInput.value.trim();
    const description = descriptionInput.value.trim();
    const color = colorInput ? colorInput.value : '#667eea';

    console.log('Category data:', { name, description, color, editingCategoryId });

    if (!name || !description) {
        showError('Please fill in all required fields');
        isSubmittingCategory = false;
        return;
    }

    // Disable button during submission
    const submitBtn = document.getElementById('create-category-btn');
    const originalText = submitBtn ? submitBtn.textContent : '';
    
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = editingCategoryId ? 'Updating...' : 'Creating...';
    }

    try {
        // Check if we're editing or creating
        if (editingCategoryId) {
            // Update existing category
            console.log('Updating category:', editingCategoryId);
            const res = await fetch(`${API.categories}/${editingCategoryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, description, color })
            });
            
            const data = await res.json();
            console.log('Update response status:', res.status, 'Response data:', data);
            
            if (!res.ok) {
                throw new Error(data.error || 'Failed to update category');
            }
            
            console.log('Category updated successfully!');
            const updatedCategoryId = editingCategoryId; // Save before resetting
            document.getElementById('category-form').reset();
            editingCategoryId = null;
            
            // Collapse if this category was expanded
            if (expandedCategoryId === updatedCategoryId) {
                expandedCategoryId = null;
            }
            
            loadCategories();
            showError('Category updated successfully!', 'success');
        } else {
            // Create new category
            console.log('Creating new category');
            const res = await fetch(API.categories, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, description, color })
            });
            
            const data = await res.json();
            console.log('Response status:', res.status, 'Response data:', data);
            
            if (!res.ok) {
                throw new Error(data.error || 'Failed to create category');
            }
            
            console.log('Category created successfully!');
            document.getElementById('category-form').reset();
            loadCategories();
            showError('Category created successfully!', 'success');
        }
    } catch (error) {
        console.error('Category operation error:', error);
        showError(error.message || 'Failed to save category. Please try again.');
    } finally {
        // Re-enable button and allow new submissions
        isSubmittingCategory = false;
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Category';
        }
    }
}

async function editCategory(id) {
    try {
        const res = await fetch(`${API.categories}/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!res.ok) throw new Error('Failed to load category');
        
        const cat = await res.json();
        document.getElementById('category-name').value = cat.name;
        document.getElementById('category-description').value = cat.description;
        document.getElementById('category-color').value = cat.color || '#667eea';
        
        editingCategoryId = id;
        const submitBtn = document.getElementById('create-category-btn');
        if (submitBtn) {
            submitBtn.textContent = 'Update Category';
        }
        
        // Scroll to form
        document.getElementById('categories-section').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        showError(error.message);
    }
}

async function deleteCategory(id) {
    if (!confirm('Delete this category? All todos in this category will also be deleted.')) return;
    try {
        const res = await fetch(`${API.categories}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to delete');
        }
        loadCategories();
        loadTodos(); // Reload todos to update counts
    } catch (error) {
        showError(error.message);
    }
}

// Todo Functions
async function loadTodos() {
    if (!token) {
        showError('Please login to view your todos');
        return;
    }
    
    try {
        loading.style.display = 'block';
        const res = await fetch(API.todos, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to load todos');
        }
        
        const todos = await res.json();
        displayTodos(todos);
    } catch (error) {
        showError('Failed to load todos: ' + error.message);
    } finally {
        loading.style.display = 'none';
    }
}

function displayTodos(todos) {
    allTodos = todos; // Store todos globally
    // Don't display todos here anymore - they'll be shown when category is expanded
    // Just update the categories display to show todo counts
    if (allCategories.length > 0) {
        displayCategories(allCategories);
    }
}

// Display todos for a specific category
function displayTodosForCategory(categoryId, todos = null) {
    // If todos not provided, filter from allTodos
    if (!todos) {
        todos = allTodos.filter(todo => 
            (todo.category?._id || todo.category) === categoryId
        );
    }
    
    if (todos.length === 0) {
        return '<p class="empty-message">No todos in this category yet. Click "Add Todo" to create one!</p>';
    }
    
    return todos.map(todo => {
        const isCompleted = todo.completed === true;
        return `
        <div class="todo-card ${todo.priority.toLowerCase()}-priority ${isCompleted ? 'completed' : ''}" data-id="${todo._id}">
            <div class="todo-header-row">
                <label class="complete-checkbox">
                    <input type="checkbox" ${isCompleted ? 'checked' : ''} onchange="toggleTodoComplete('${todo._id}', this.checked)">
                    <span class="checkmark"></span>
                </label>
                <div class="todo-content">
                    <h4 class="${isCompleted ? 'completed-text' : ''}">${escapeHtml(todo.title)}</h4>
                    <p class="${isCompleted ? 'completed-text' : ''}">${escapeHtml(todo.description)}</p>
                </div>
            </div>
            <div class="todo-meta">
                <span class="badge priority-badge">${escapeHtml(todo.priority)}</span>
            </div>
            <div class="todo-actions">
                <button class="btn-edit" onclick="editTodo('${todo._id}')">✏️ Edit</button>
                <button class="btn-delete" onclick="deleteTodo('${todo._id}')">🗑️ Delete</button>
            </div>
        </div>
        `;
    }).join('');
}

// Toggle category expansion
function toggleCategory(categoryId) {
    if (expandedCategoryId === categoryId) {
        expandedCategoryId = null; // Collapse
    } else {
        expandedCategoryId = categoryId; // Expand
    }
    displayCategories(allCategories);
}

// Filter todos in a category based on search
function filterTodosInCategory(categoryId, searchTerm) {
    const todosContainer = document.getElementById(`todos-${categoryId}`);
    if (!todosContainer) return;
    
    const allCategoryTodos = allTodos.filter(todo => 
        (todo.category?._id || todo.category) === categoryId
    );
    
    if (!searchTerm || searchTerm.trim() === '') {
        // Show all todos if search is empty
        todosContainer.innerHTML = displayTodosForCategory(categoryId, allCategoryTodos);
        return;
    }
    
    // Filter todos by search term (title or description)
    const searchLower = searchTerm.toLowerCase();
    const filteredTodos = allCategoryTodos.filter(todo => 
        todo.title.toLowerCase().includes(searchLower) ||
        todo.description.toLowerCase().includes(searchLower)
    );
    
    if (filteredTodos.length === 0) {
        todosContainer.innerHTML = '<p class="empty-message">No todos found matching your search.</p>';
    } else {
        todosContainer.innerHTML = displayTodosForCategory(categoryId, filteredTodos);
    }
}

async function handleTodoSubmit(e) {
    e.preventDefault();
    if (!token || !user) {
        showError('Please login to create todos');
        return;
    }

    const category = document.getElementById('category').value;
    if (!category) {
        showError('Please create a category first, then select it when creating a todo');
        return;
    }

    const data = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        category: category,
        priority: document.getElementById('priority').value,
        completed: false
    };

    try {
        const url = editingTodoId ? `${API.todos}/${editingTodoId}` : API.todos;
        const method = editingTodoId ? 'PUT' : 'POST';
        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to save');
        todoForm.reset();
        cancelEdit();
        loadTodos(); // Reload to update counts
        // If the category is expanded, refresh its display
        if (expandedCategoryId) {
            displayCategories(allCategories);
        }
    } catch (error) {
        showError(error.message);
    }
}

async function editTodo(id) {
    try {
        const res = await fetch(`${API.todos}/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!res.ok) throw new Error('Failed to load todo');
        const todo = await res.json();
        document.getElementById('title').value = todo.title;
        document.getElementById('description').value = todo.description;
        document.getElementById('category').value = todo.category?._id || todo.category;
        document.getElementById('priority').value = todo.priority;
        editingTodoId = id;
        document.getElementById('form-title').textContent = 'Edit To-Do';
        document.getElementById('submit-btn').textContent = 'Update To-Do';
        document.getElementById('cancel-btn').style.display = 'block';
        todoFormSection.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        showError(error.message);
    }
}

async function deleteTodo(id) {
    if (!confirm('Delete this todo?')) return;
    try {
        const res = await fetch(`${API.todos}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to delete');
        loadTodos(); // Reload to update counts
        // If the category is expanded, refresh its display
        if (expandedCategoryId) {
            displayCategories(allCategories);
        }
    } catch (error) {
        showError(error.message);
    }
}

function cancelEdit() {
    editingTodoId = null;
    document.getElementById('form-title').textContent = 'Create New To-Do';
    document.getElementById('submit-btn').textContent = 'Create To-Do';
    document.getElementById('cancel-btn').style.display = 'none';
    todoForm.reset();
}

// Utility
function showError(msg, type = 'error') {
    errorMessage.textContent = msg;
    if (type === 'success') {
        errorMessage.style.background = '#d4edda';
        errorMessage.style.color = '#155724';
        errorMessage.style.border = '1px solid #c3e6cb';
    } else {
        errorMessage.style.background = '#fee';
        errorMessage.style.color = '#c33';
        errorMessage.style.border = '1px solid #fcc';
    }
    errorMessage.style.display = 'block';
    setTimeout(() => errorMessage.style.display = 'none', 5000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Create todo in specific category
function createTodoInCategory(categoryId, categoryName) {
    document.getElementById('category').value = categoryId;
    document.getElementById('todo-form-section').scrollIntoView({ behavior: 'smooth' });
    document.getElementById('title').focus();
}

// Toggle todo complete status (checkbox)
async function toggleTodoComplete(todoId, isCompleted) {
    try {
        // Get current todo to preserve other fields
        const res = await fetch(`${API.todos}/${todoId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load todo');
        
        const todo = await res.json();
        
        // Update completed field
        const updateRes = await fetch(`${API.todos}/${todoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title: todo.title,
                description: todo.description,
                category: todo.category._id || todo.category,
                priority: todo.priority,
                completed: isCompleted
            })
        });
        
        if (!updateRes.ok) {
            const data = await updateRes.json();
            throw new Error(data.error || 'Failed to update todo');
        }
        
        // Reload todos to show updated status
        loadTodos();
        // If the category is expanded, refresh its display
        if (expandedCategoryId) {
            displayCategories(allCategories);
        }
    } catch (error) {
        console.error('Error toggling todo complete:', error);
        showError(error.message || 'Failed to update todo');
        // Reload to reset checkbox state
        loadTodos();
    }
}

// Make functions global for onclick
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;
window.editTodo = editTodo;
window.deleteTodo = deleteTodo;
window.createTodoInCategory = createTodoInCategory;
window.handleCategorySubmit = handleCategorySubmit;
window.toggleTodoComplete = toggleTodoComplete;
window.toggleCategory = toggleCategory;
window.filterTodosInCategory = filterTodosInCategory;
