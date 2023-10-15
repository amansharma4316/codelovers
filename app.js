const express = require('express');
const multer = require('multer');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');
const app = express();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // Correct the path to the HTML file.
});

app.post('/upload', upload.single('html_file'), (req, res) => {
    const htmlFilePath = path.join(__dirname, 'uploads', req.file.filename);

    // Convert HTML to DOCX using Mammoth
    mammoth.convert({ path: htmlFilePath })
        .then((result) => {
            const docxContent = result.value;
            const convertedFilePath = path.join(__dirname, 'converted', 'output.docx');

            fs.writeFileSync(convertedFilePath, docxContent);

            res.download(convertedFilePath, 'output.docx', (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Error downloading the DOCX file.');
                } else {
                    console.log('File converted and downloaded successfully.');
                }
            });
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error converting the HTML to DOCX.');
        });
});

app.post('/html-content', (req, res) => {
    const htmlFilePath = path.join(__dirname, 'uploads', req.file.filename);

    fs.readFile(htmlFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading the uploaded HTML file.');
        } else {
            res.send(data);
        }
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});