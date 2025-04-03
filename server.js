const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Load flashcards from JSON file
function loadFlashcards() {
    const filePath = path.join(__dirname, 'flashcards.json');
    if (!fs.existsSync(filePath)) {
        return { flashcards: [], results: { correct: 0, total: 0 } };
    }

    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
}

// Save flashcards to JSON file
function saveFlashcards(data) {
    const filePath = path.join(__dirname, 'flashcards.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Home route
app.get('/', (req, res) => {
    const data = loadFlashcards();
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Add Flashcard route (GET)
app.get('/add_flashcard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'add_flashcard.html'));
});

// Add Flashcard route (POST)
app.post('/add_flashcard', (req, res) => {
    const { topic, question, answer } = req.body;
    const data = loadFlashcards();
    data.flashcards.push({ topic, question, answer });
    saveFlashcards(data);
    res.redirect('/');
});

// Test Flashcards route (GET)
app.get('/test_flashcards', (req, res) => {
    const data = loadFlashcards();
    if (data.flashcards.length === 0) {
        return res.redirect('/add_flashcard');
    }
    const randomFlashcard = data.flashcards[Math.floor(Math.random() * data.flashcards.length)];
    res.sendFile(path.join(__dirname, 'public', 'test_flashcards.html'));
});

// Test Flashcards route (POST)
app.post('/test_flashcards', (req, res) => {
    const { answer, question } = req.body;
    const data = loadFlashcards();
    const flashcard = data.flashcards.find(f => f.question === question);
    const correctAnswer = flashcard ? flashcard.answer : null;

    if (answer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()) {
        data.results.correct++;
    }
    data.results.total++;

    saveFlashcards(data);
    res.redirect('/test_flashcards');
});

// Show results
app.get('/result_flashcard', (req, res) => {
    const data = loadFlashcards();
    const { correct, total } = data.results;
    const accuracy = total > 0 ? (correct / total) * 100 : 0;
    res.sendFile(path.join(__dirname, 'public', 'result_flashcard.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
