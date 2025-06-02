var express = require('express')
var app = express();
var session = require('express-session');
var conn = require('./dbConfig');

app.set('view engine', 'ejs');

// Session setup
app.use(session({
  secret: 'yoursecret',
  resave: true,
  saveUninitialized: true
}));

app.use('/public', express.static('public'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Home page
app.get('/', function (req, res) {
  res.render("home");
});

// Login page
app.get('/login', function (req, res) {
  res.render('login.ejs');
});

// Authentication logic
app.post('/auth', function (req, res) {
  let name = req.body.username;
  let password = req.body.password;

  if (name && password) {
    conn.query(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [name, password],
      function (error, results, fields) {
        if (error) {
          console.error(error);
          return res.status(500).send('Internal Server Error');
        }

        if (results.length > 0) {
          req.session.loggedin = true;
          req.session.username = name;
          return res.redirect('/membersonly');
        } else {
            return res.send(`<h2 style="color:red;">Incorrect Username and/or Password!</h2>
            <button onclick="history.back()">Back to Login Page</button>`);
          
        }
      }
    );
  } else {
    return res.send('Please enter Username and Password!');
  }
});

// Protected page
app.get('/membersonly', function (req, res) {
  if (req.session.loggedin) {
    return res.render('membersonly');
  } else {
    return res.send('Please login to view this page!');
  }
});



app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (username && password) {
        conn.query('SELECT * FROM users WHERE username = ?', [username], (error, results) => {
            if (error) throw error;

            if (results.length > 0) {
                req.session.message = { type: 'error', text: 'Registration failed: Username already taken' };
                res.redirect('/register');
            } else {
                conn.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], (err) => {
                    if (err) throw err;

                    req.session.message = { type: 'success', text: 'Registration successful. You can now log in.' };
                    res.redirect('/login');
                });
            }
        });
    } else {
        req.session.message = { type: 'error', text: 'Please fill out both fields.' };
        res.redirect('/register');
    }
});
//Adding a MP to the list 
app.post('/addMPs', function (req, res, next) {
  var id = req.body.id;
  var name = req.body.name;
  var party = req.body.party;
  var sql = 'INSERT INTO mps (id, name, party) VALUES (?, ?, ?)';
  conn.query(sql, [id, name, party], function (err, result) {
    if (err) {
      console.error(err);
      return res.status(500).send('<h3>Error adding MP to the database. <br>Please check all fields are filled</br></h3>');
    }
    console.log("MP added successfully");
  
    // Redirect to the MPs list page after adding
   return res.send('<h2>New MP record added successfully!</h2><a href="/listMPs">Click to View MP List</a>');
  
  });
});
// Users can add MP's if only if they are logged in
app.get('/addMPs', function (req, res, next) {
  if (req.session.loggedin) {
    res.render('addMPs');
  } else {
    res.send('Please login to view this page!');
  }
});

// Display of MP's list
app.get('/listMPs', function (req, res) {
  conn.query('SELECT * FROM mps', function (err, result) {
    if (err) throw err;
      console.log("MP's list");
      console.log(result);
      res.render('listMPs', { title: 'List of NZ MPs', MPsdata: result});
    });    
  });

// Other pages
app.get('/auckland', function (req, res) {
  res.render("auckland");
});

app.get('/beaches', function (req, res) {
  res.render("beaches");
});

// User clicking logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});
// Start the server
app.listen(3000, () => {
  console.log('My Node app server is running on port 3000');
});
