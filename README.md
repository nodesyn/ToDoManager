# To-Do List Application

A clean, responsive Flask-based to-do list application with modern UI and intuitive task management features.

![To-Do List Application](https://img.shields.io/badge/Flask-To--Do%20List-blue)
![Version](https://img.shields.io/badge/version-1.0.0-green)
![License](https://img.shields.io/badge/license-MIT-orange)

## Features

- **Task Management**: Create, edit, and delete tasks easily
- **Priority Levels**: Assign low, medium, or high priority to tasks
- **Task Filtering**: Filter tasks by their completion status (All, Active, Completed)
- **Flexible Sorting**: Sort tasks by creation date, priority, or alphabetically
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Theme**: Easy on the eyes with a modern dark interface
- **Real-time Updates**: Instant UI updates when task status changes

## Technologies Used

- **Backend**: Flask (Python)
- **Frontend**: HTML, CSS, JavaScript
- **UI Framework**: Bootstrap 5
- **Icons**: Font Awesome
- **Data Storage**: JSON (file-based)

## Screenshots

*Add screenshots of your application here*

## Installation & Setup

### Prerequisites

- Python 3.11 or higher
- Flask

### Installation Steps

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/todo-list-app.git
   cd todo-list-app
   ```

2. Install the required packages:
   ```
   pip install -r requirements.txt
   ```

3. Start the application:
   ```
   gunicorn --bind 0.0.0.0:5000 main:app
   ```

4. Access the application in your browser:
   ```
   http://localhost:5000
   ```

## Project Structure

```
├── static/                # Static assets
│   ├── css/               # CSS files
│   │   └── custom.css     # Custom styling
│   └── js/                # JavaScript files
│       └── main.js        # Main frontend logic
├── templates/             # HTML templates
│   ├── base.html          # Base template with common structure
│   └── index.html         # Main application page
├── app.py                 # Application logic and API endpoints
├── main.py                # Application entry point
├── models.py              # Data models (placeholder for DB migration)
└── tasks.json             # Task data storage
```

## Usage

### Managing Tasks

1. **Create a Task**: Enter a title, optional description, and select a priority level
2. **Mark as Complete**: Check the checkbox next to a task
3. **Edit a Task**: Click the edit (pencil) icon to modify a task
4. **Delete a Task**: Click the delete (trash) icon and confirm deletion

### Filtering and Sorting

- Use the filter buttons (All, Active, Completed) to narrow down your task list
- Use the dropdown menu to sort tasks by different criteria:
  - Newest First
  - Oldest First
  - Highest Priority
  - Lowest Priority
  - Title A-Z
  - Title Z-A

## Future Enhancements

- User accounts and authentication
- Due dates and reminders
- Task categories/tags
- Data persistence with a database
- Search functionality
- Dark/Light theme toggle

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Flask documentation
- Bootstrap documentation
- Font Awesome icons