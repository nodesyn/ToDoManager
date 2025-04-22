import os
import json
import logging
from datetime import datetime
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, session

# Configure logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "default-dev-secret-key")

# Data file path
TASKS_FILE = 'tasks.json'

def load_tasks():
    """Load tasks from the JSON file"""
    try:
        if os.path.exists(TASKS_FILE):
            with open(TASKS_FILE, 'r') as f:
                return json.load(f)
        return []
    except Exception as e:
        logging.error(f"Error loading tasks: {e}")
        return []

def save_tasks(tasks):
    """Save tasks to the JSON file"""
    try:
        with open(TASKS_FILE, 'w') as f:
            json.dump(tasks, f, indent=2)
    except Exception as e:
        logging.error(f"Error saving tasks: {e}")

@app.route('/')
def index():
    """Render the main page"""
    return render_template('index.html')

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    """API endpoint to get all tasks"""
    filter_type = request.args.get('filter', 'all')
    tasks = load_tasks()
    
    if filter_type == 'active':
        tasks = [task for task in tasks if not task.get('completed', False)]
    elif filter_type == 'completed':
        tasks = [task for task in tasks if task.get('completed', False)]
    
    sort_by = request.args.get('sort', 'created')
    reverse = request.args.get('direction', 'desc') == 'desc'
    
    if sort_by == 'priority':
        # Convert priority to numerical value for sorting
        priority_values = {'high': 3, 'medium': 2, 'low': 1, '': 0}
        tasks = sorted(tasks, key=lambda x: priority_values.get(x.get('priority', ''), 0), reverse=reverse)
    elif sort_by == 'created':
        tasks = sorted(tasks, key=lambda x: x.get('created_at', ''), reverse=reverse)
    elif sort_by == 'title':
        tasks = sorted(tasks, key=lambda x: x.get('title', '').lower(), reverse=reverse)
    
    return jsonify(tasks)

@app.route('/api/tasks', methods=['POST'])
def add_task():
    """API endpoint to add a new task"""
    data = request.get_json()
    
    if not data or 'title' not in data or not data['title'].strip():
        return jsonify({'error': 'Task title is required'}), 400
    
    tasks = load_tasks()
    
    new_task = {
        'id': len(tasks) + 1,
        'title': data['title'].strip(),
        'description': data.get('description', '').strip(),
        'priority': data.get('priority', 'medium'),
        'created_at': datetime.now().isoformat(),
        'completed': False
    }
    
    tasks.append(new_task)
    save_tasks(tasks)
    
    return jsonify(new_task), 201

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """API endpoint to update a task"""
    data = request.get_json()
    tasks = load_tasks()
    
    for task in tasks:
        if task.get('id') == task_id:
            if 'title' in data and data['title'].strip():
                task['title'] = data['title'].strip()
            if 'description' in data:
                task['description'] = data['description'].strip()
            if 'priority' in data:
                task['priority'] = data['priority']
            if 'completed' in data:
                task['completed'] = data['completed']
            
            save_tasks(tasks)
            return jsonify(task)
    
    return jsonify({'error': 'Task not found'}), 404

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """API endpoint to delete a task"""
    tasks = load_tasks()
    
    for i, task in enumerate(tasks):
        if task.get('id') == task_id:
            del tasks[i]
            save_tasks(tasks)
            return jsonify({'success': True})
    
    return jsonify({'error': 'Task not found'}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
