const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Data file path
const dataPath = path.join(__dirname, 'data', 'tasks.json');

// Ensure data directory and file exist
async function initializeDataFile() {
    try {
        await fs.mkdir(path.join(__dirname, 'data'), { recursive: true });
        try {
            await fs.access(dataPath);
        } catch {
            await fs.writeFile(dataPath, JSON.stringify([]));
        }
    } catch (error) {
        console.error('Error initializing data file:', error);
    }
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Get all tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const data = await fs.readFile(dataPath, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ error: 'Error reading tasks' });
    }
});

// Add new task
app.post('/api/tasks', async (req, res) => {
    try {
        const { task } = req.body;
        const data = await fs.readFile(dataPath, 'utf8');
        const tasks = JSON.parse(data);
        const newTask = {
            id: Date.now(),
            text: task,
            completed: false
        };
        tasks.push(newTask);
        await fs.writeFile(dataPath, JSON.stringify(tasks));
        res.json(newTask);
    } catch (error) {
        res.status(500).json({ error: 'Error adding task' });
    }
});

// Delete task
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const data = await fs.readFile(dataPath, 'utf8');
        let tasks = JSON.parse(data);
        tasks = tasks.filter(task => task.id !== id);
        await fs.writeFile(dataPath, JSON.stringify(tasks));
        res.json({ message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting task' });
    }
});

// Initialize data file and start server
initializeDataFile().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}); 