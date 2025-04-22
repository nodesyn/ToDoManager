document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskForm = document.getElementById('task-form');
    const tasksList = document.getElementById('tasks-list');
    const tasksContainer = document.getElementById('tasks-container');
    const loadingIndicator = document.getElementById('loading-indicator');
    const noTasksMessage = document.getElementById('no-tasks-message');
    const tasksCount = document.getElementById('tasks-count');
    const filterButtons = document.querySelectorAll('[data-filter]');
    const sortSelect = document.getElementById('sort-tasks');
    
    // Edit task modal elements
    const editTaskModal = document.getElementById('edit-task-modal');
    const editTaskForm = document.getElementById('edit-task-form');
    const editTaskId = document.getElementById('edit-task-id');
    const editTaskTitle = document.getElementById('edit-task-title');
    const editTaskDescription = document.getElementById('edit-task-description');
    const editTaskPriority = document.getElementById('edit-task-priority');
    const saveEditTaskBtn = document.getElementById('save-edit-task');
    
    // Confirmation modal elements
    const confirmModal = document.getElementById('confirm-modal');
    const confirmActionBtn = document.getElementById('confirm-action-btn');
    
    // Current state
    let currentFilter = 'all';
    let currentSort = 'created';
    let currentDirection = 'desc';
    
    // Initialize the application
    init();
    
    function init() {
        // Load tasks on page load
        loadTasks();
        
        // Set up event listeners
        taskForm.addEventListener('submit', handleAddTask);
        saveEditTaskBtn.addEventListener('click', handleSaveEdit);
        
        // Filter buttons event listeners
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                currentFilter = button.getAttribute('data-filter');
                loadTasks();
            });
        });
        
        // Sort select event listener
        sortSelect.addEventListener('change', () => {
            const [sort, direction] = sortSelect.value.split('-');
            currentSort = sort;
            currentDirection = direction;
            loadTasks();
        });
    }
    
    // Load tasks from the API
    function loadTasks() {
        showLoading(true);
        
        fetch(`/api/tasks?filter=${currentFilter}&sort=${currentSort}&direction=${currentDirection}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(tasks => {
                renderTasks(tasks);
                updateTasksCount(tasks.length);
                showLoading(false);
            })
            .catch(error => {
                console.error('Error fetching tasks:', error);
                showError('Failed to load tasks. Please try again.');
                showLoading(false);
            });
    }
    
    // Render tasks to the DOM
    function renderTasks(tasks) {
        tasksList.innerHTML = '';
        
        if (tasks.length === 0) {
            noTasksMessage.style.display = 'block';
            return;
        }
        
        noTasksMessage.style.display = 'none';
        
        tasks.forEach(task => {
            const taskElement = createTaskElement(task);
            tasksList.appendChild(taskElement);
        });
    }
    
    // Create a DOM element for a task
    function createTaskElement(task) {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.dataset.id = task.id;
        
        if (task.completed) {
            li.classList.add('list-group-item-secondary');
        }
        
        // Priority badge
        const priorityBadge = document.createElement('span');
        priorityBadge.className = getPriorityBadgeClass(task.priority);
        priorityBadge.textContent = capitalizeFirstLetter(task.priority);
        
        // Task content container
        const contentDiv = document.createElement('div');
        contentDiv.className = 'ms-2 me-auto';
        
        // Task title
        const titleDiv = document.createElement('div');
        titleDiv.className = 'd-flex align-items-center';
        
        // Checkbox for task completion
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'form-check-input me-2';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleTaskCompletion(task.id, checkbox.checked));
        
        titleDiv.appendChild(checkbox);
        
        // Title text
        const titleSpan = document.createElement('span');
        titleSpan.className = task.completed ? 'text-decoration-line-through' : '';
        titleSpan.textContent = task.title;
        titleDiv.appendChild(titleSpan);
        
        contentDiv.appendChild(titleDiv);
        
        // Task description (if any)
        if (task.description) {
            const descriptionDiv = document.createElement('div');
            descriptionDiv.className = 'small text-muted ms-4';
            descriptionDiv.textContent = task.description;
            contentDiv.appendChild(descriptionDiv);
        }
        
        // Action buttons container
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'd-flex';
        
        // Edit button
        const editButton = document.createElement('button');
        editButton.className = 'btn btn-sm btn-outline-primary me-1';
        editButton.innerHTML = '<i class="fas fa-edit"></i>';
        editButton.addEventListener('click', () => openEditModal(task));
        actionsDiv.appendChild(editButton);
        
        // Delete button
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-sm btn-outline-danger';
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.addEventListener('click', () => confirmDeleteTask(task.id));
        actionsDiv.appendChild(deleteButton);
        
        // Construct the list item
        li.appendChild(contentDiv);
        li.appendChild(priorityBadge);
        li.appendChild(actionsDiv);
        
        return li;
    }
    
    // Handle adding a new task
    function handleAddTask(e) {
        e.preventDefault();
        
        const titleInput = document.getElementById('task-title');
        const descriptionInput = document.getElementById('task-description');
        const priorityInput = document.getElementById('task-priority');
        
        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();
        const priority = priorityInput.value;
        
        if (!title) {
            showError('Task title is required!');
            return;
        }
        
        const task = {
            title,
            description,
            priority
        };
        
        fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(() => {
            // Clear form
            titleInput.value = '';
            descriptionInput.value = '';
            priorityInput.value = 'medium';
            
            // Reload tasks
            loadTasks();
            
            // Show success message
            showSuccess('Task added successfully!');
        })
        .catch(error => {
            console.error('Error adding task:', error);
            showError('Failed to add task. Please try again.');
        });
    }
    
    // Toggle task completion status
    function toggleTaskCompletion(taskId, completed) {
        fetch(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ completed })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(() => {
            // Reload tasks
            loadTasks();
        })
        .catch(error => {
            console.error('Error updating task:', error);
            showError('Failed to update task. Please try again.');
        });
    }
    
    // Open edit modal for a task
    function openEditModal(task) {
        editTaskId.value = task.id;
        editTaskTitle.value = task.title;
        editTaskDescription.value = task.description || '';
        editTaskPriority.value = task.priority;
        
        // Create and show the Bootstrap modal
        const modal = new bootstrap.Modal(editTaskModal);
        modal.show();
    }
    
    // Handle saving task edits
    function handleSaveEdit() {
        const taskId = editTaskId.value;
        const title = editTaskTitle.value.trim();
        const description = editTaskDescription.value.trim();
        const priority = editTaskPriority.value;
        
        if (!title) {
            showError('Task title is required!');
            return;
        }
        
        const updatedTask = {
            title,
            description,
            priority
        };
        
        fetch(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedTask)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(() => {
            // Close the modal
            const modal = bootstrap.Modal.getInstance(editTaskModal);
            modal.hide();
            
            // Reload tasks
            loadTasks();
            
            // Show success message
            showSuccess('Task updated successfully!');
        })
        .catch(error => {
            console.error('Error updating task:', error);
            showError('Failed to update task. Please try again.');
        });
    }
    
    // Confirm task deletion
    function confirmDeleteTask(taskId) {
        // Set up the confirm modal
        const actionBtn = document.getElementById('confirm-action-btn');
        
        // Remove any existing event listeners
        const newActionBtn = actionBtn.cloneNode(true);
        actionBtn.parentNode.replaceChild(newActionBtn, actionBtn);
        
        // Add new event listener
        newActionBtn.addEventListener('click', () => deleteTask(taskId));
        
        // Show the modal
        const modal = new bootstrap.Modal(confirmModal);
        modal.show();
    }
    
    // Delete a task
    function deleteTask(taskId) {
        // Close the modal
        const modal = bootstrap.Modal.getInstance(confirmModal);
        modal.hide();
        
        fetch(`/api/tasks/${taskId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(() => {
            // Reload tasks
            loadTasks();
            
            // Show success message
            showSuccess('Task deleted successfully!');
        })
        .catch(error => {
            console.error('Error deleting task:', error);
            showError('Failed to delete task. Please try again.');
        });
    }
    
    // Helper functions
    function showLoading(isLoading) {
        if (isLoading) {
            loadingIndicator.style.display = 'block';
            tasksList.style.display = 'none';
            noTasksMessage.style.display = 'none';
        } else {
            loadingIndicator.style.display = 'none';
            tasksList.style.display = 'block';
        }
    }
    
    function updateTasksCount(count) {
        tasksCount.textContent = `${count} task${count !== 1 ? 's' : ''}`;
    }
    
    function getPriorityBadgeClass(priority) {
        switch (priority) {
            case 'high':
                return 'badge bg-danger me-2';
            case 'medium':
                return 'badge bg-warning me-2';
            case 'low':
                return 'badge bg-info me-2';
            default:
                return 'badge bg-secondary me-2';
        }
    }
    
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    function showError(message) {
        // Create toast for error message
        createToast(message, 'danger');
    }
    
    function showSuccess(message) {
        // Create toast for success message
        createToast(message, 'success');
    }
    
    function createToast(message, type) {
        // Check if toast container exists, create it if not
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }
        
        // Create toast element
        const toastElement = document.createElement('div');
        toastElement.className = `toast align-items-center text-white bg-${type} border-0`;
        toastElement.setAttribute('role', 'alert');
        toastElement.setAttribute('aria-live', 'assertive');
        toastElement.setAttribute('aria-atomic', 'true');
        
        // Toast body
        const toastBody = document.createElement('div');
        toastBody.className = 'd-flex';
        
        const toastBodyContent = document.createElement('div');
        toastBodyContent.className = 'toast-body';
        toastBodyContent.textContent = message;
        
        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = 'btn-close btn-close-white me-2 m-auto';
        closeButton.setAttribute('data-bs-dismiss', 'toast');
        closeButton.setAttribute('aria-label', 'Close');
        
        toastBody.appendChild(toastBodyContent);
        toastBody.appendChild(closeButton);
        toastElement.appendChild(toastBody);
        
        // Add toast to container
        toastContainer.appendChild(toastElement);
        
        // Initialize and show toast
        const toast = new bootstrap.Toast(toastElement, {
            autohide: true,
            delay: 3000
        });
        toast.show();
        
        // Remove toast from DOM after it's hidden
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    }
});
