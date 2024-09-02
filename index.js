const { time } = require('console');
const express = require('express');
const app = express();
const fs = require('fs').promises; // Use promises for async/await

// count the number of requests
let reqCount = 0;

// Create a middleware that counts total number of requests sent to a server. Also create an endpoint that exposes it
const requestCounter = (req, res, next) => {

    reqCount++;
    console.log(`Number of requests so far : ${reqCount}`);
    next();
}

// Create a middleware function that logs each incoming request’s HTTP method, URL, and timestamp to the console
const customMW = (req, res, next) => {
    const method = req.method;
    const completeURL = req.protocol + '://' + req.get('host') + req.originalUrl;
    const timestamp = new Date().toISOString();
    console.log(`method : ${method}
                 complete URL : ${completeURL}
                 time stamp : ${timestamp}`);
    
    // call the next middleware function.
    next();
}

// middle-ware used to parse all the incoming data.
app.use(requestCounter);
app.use(customMW);
app.use(express.json()); 
// app.use(express.urlencoded({ extended: true })); 

// Landing page
app.get('/', (req, res) => {
    res.send("<div><h1><center><b>This is TODO-CRUD API written in Node.js</b></center></h1></div>");
});

// Get all the reqeust counts so far..
app.get('/reqcounts', (req, res) => {
    res.json({
        reqCount
    })
    // console.log(`Requests so far are : ${reqCount}`);
})

// Get all the todos
app.get('/todos', async (req, res) => {
    try {
        const data = await fs.readFile('todo.json', 'utf-8');
        const todos = JSON.parse(data); // Parse JSON data
        res.json(todos);
    } catch (err) {
        console.log(`Error occurred: ${err}`);
        res.status(500).json({ error: 'An error occurred while reading todos.' });
    }
});

// Create a todo
app.post('/tasks', async (req, res) => {
    try {
        // Read existing tasks
        const data = await fs.readFile('todo.json', 'utf-8');
        const tasks = JSON.parse(data);

        // Create a new Task
        const currDate = new Date();
        const currTime = currDate.getTime();

        const newTask = {
            name: req.body.name,
            description: req.body.description,
            created_at: currTime,
            isCompleted: req.body.isCompleted,
            priority: req.body.priority
        };

        // Generate new ID for the task
        const newId = Object.keys(tasks).length + 1;
        tasks[newId] = newTask;

        // Write the updated tasks to the file
        await fs.writeFile('todo.json', JSON.stringify(tasks, null, 2), 'utf-8');
        console.log('Task added successfully!');
        res.status(201).json(newTask);

    } 
    catch (err) {
        console.log(`Error while handling task: ${err}`);
        res.status(500).json({ error: 'An error occurred while creating the task.' });
    }
});

const port = process.env.PORT || 3000;

// Start listening at the port
app.listen(port, () => {
    console.log(`Listening at port: ${port}`);
});
