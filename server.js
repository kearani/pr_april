const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

//путь к базе данных документов
const path = require('path');
const DB_PATH = path.join(__dirname, 'db.json');

//загрузка данных
const getData = () => JSON.parse(fs.readFileSync(DB_PATH));
const saveData = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

//получение документов
app.get('/api/documents', (req, res) => {
    const data = getData();
    res.json(data.documents);
});

//создание документа
app.post('/api/documents', (req, res) => {
    const data = getData();
    const lastId = data.documents.length > 0 ? data.documents[data.documents.length - 1].id : 0;
    
    const now = new Date();
    const formattedDate = now.toLocaleString('ru-RU', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).replace(',', '');

    const newDoc = {
        id: lastId + 1,
        title: req.body.title,
        author: req.body.author || "Аноним",
        date: formattedDate,
        status: "Новый"
    };

    data.documents.push(newDoc);
    saveData(data);
    res.status(201).json(newDoc);
}); 

app.put('/api/documents/:id', (req, res) => {
    const data = getData();
    const id = parseInt(req.params.id);
    const index = data.documents.findIndex(d => d.id === id);

    if (index !== -1) {
        data.documents[index].title = req.body.title || data.documents[index].title;
        data.documents[index].date = req.body.date || data.documents[index].date;
        saveData(data);
        res.json(data.documents[index]);
    } else {
        res.status(404).send("Не найден");
    }
});

app.delete('/api/documents/:id', (req, res) => {
    let data = getData();
    const id = parseInt(req.params.id);
    
    data.documents = data.documents.filter(d => d.id !== id);

    data.documents = data.documents.map((doc, index) => {
        return { ...doc, id: index + 1 };
    });

    saveData(data);
    res.json({ message: "Удалено" });
}); 

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});
