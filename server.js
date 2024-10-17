const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true })); // For form data
app.use(bodyParser.json());

app.use(express.static('public'));

const filePath = './userdata.txt';

// Function to add 1 hour to a given time string
function addOneHour(time) {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setMinutes(date.getMinutes() + 60); // Add 1 hour
    const newHours = String(date.getHours()).padStart(2, '0');
    const newMinutes = String(date.getMinutes()).padStart(2, '0');
    return `${newHours}:${newMinutes}`;
}

app.post('/submit', (req, res) => {
    const { firstName, lastName, email, date1, time1, date2, time2 } = req.body;

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) throw err;

        let users = data ? JSON.parse(data) : [];

        // Format time as 1-hour block (e.g., "09:00 - 10:00")
        const time1End = addOneHour(time1);
        const time2End = addOneHour(time2);
        const timeBlock1 = `${time1} - ${time1End}`;
        const timeBlock2 = `${time2} - ${time2End}`;

        // Check if email already exists
        let emailExists = users.find(user => user.email === email);
        if (emailExists) {
            return res.status(400).json({ message: 'Email already exists!' });
        }

        // Check if the date and time combination (as a block) already exists
        let dateTimeExists1 = users.find(user => user.date1 === date1 && user.timeBlock1 === timeBlock1);
        let dateTimeExists2 = users.find(user => user.date2 === date2 && user.timeBlock2 === timeBlock2);

        if (dateTimeExists1 || dateTimeExists2) {
            return res.status(400).json({ message: 'Date and time block already booked!' });
        }

        // Add new user with the formatted time blocks
        const newUser = {
            firstName,
            lastName,
            email,
            date1,
            timeBlock1,
            date2,
            timeBlock2
        };
        
        users.push(newUser);

        // Save updated data to userdata.txt
        fs.writeFile(filePath, JSON.stringify(users, null, 2), err => {
            if (err) throw err;
            res.json({ message: 'Appointment booked successfully!' });
        });
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
