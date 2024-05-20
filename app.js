const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(express.json());
const path = require('path');

const { MongoClient, ObjectId } = require('mongodb');

var userID = '';
const port = 8081;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'sessions';

app.set('trust proxy', 'loopback');


app.use(express.static(path.dirname('/var/www/htdocs')));

app.get('/', async function (req, res) {
  var user = JSON.parse(req.headers['x-kvd-payload']);
  userID = user.user;
  res.sendFile('/var/www/htdocs/index.html');
})

app.get('/sessions', async function (req, res) {
  const client = new MongoClient(mongoUrl);
  await client.connect();

  try {
    const db = client.db(dbName);
    var user = JSON.parse(req.headers['x-kvd-payload']);
    userID = user.user;
    const collection = db.collection('sessions');
    const sessionData = await collection.find({ userID: userID }).toArray();
    res.json(sessionData);
  } catch (error) {
    console.error("Error retrieving session data:", error);
    res.status(500).json({ error: "Failed to retrieve session data" });
  } finally {
    client.close();
  }
});

app.get('/allSessions', async function (req, res) {
  const client = new MongoClient(mongoUrl);
  await client.connect();

  try {
    const db = client.db(dbName);
    const collection = db.collection('sessions');
    const sessionData = await collection.find({}).toArray();
    res.json(sessionData);
  } catch (error) {
    console.error("Error retrieving session data:", error);
    res.status(500).json({ error: "Failed to retrieve session data" });
  } finally {
    client.close();
  }
});


async function connectToDatabase() {
  const client = new MongoClient(mongoUrl);
  await client.connect();
  return client;
}


app.get('/sessions/:id', async function (req, res) {
  const sessionId = req.params.id;
  let client;

  try {
    client = await connectToDatabase();

    const db = client.db(dbName);
    const collection = db.collection('sessions');

    const session = await collection.findOne({ _id: new ObjectId(sessionId) });

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    res.json(session);
  } catch (error) {
    console.error('Error retrieving session:', error);
    res.status(500).json({ error: 'Error retrieving session' });
  } finally {
    if (client) {
      client.close();
    }
  }
});


app.post('/sessions', async function (req, res) {
  console.log("got a post request");
  let client; 

  try {
    client = new MongoClient(mongoUrl);
    await client.connect();

    var user = JSON.parse(req.headers['x-kvd-payload']);
    userID = user.user;
    

    var masterIntervalData = req.body.masterIntervalData;
    masterIntervalData.userID = userID;

    const db = client.db(dbName);
    const data = db.collection('sessions');
    const result = await data.insertOne(masterIntervalData);

    const insertedId = result.insertedId.toString();

    console.log("Inserted ID:", insertedId);
    console.log("userID insered: ", masterIntervalData.userID);

    res.status(200).send(insertedId);
  } catch (error) {
    console.error("Error saving session data:", error);
    res.status(500).send("Error saving session data");
  } finally {
    if (client) {
      console.log("now closing client");
      client.close();
    }
  }
});


app.post('/submit-feedback', async (req, res) => {
  console.log("submitting feedback");
  let client;
  try {
    client = new MongoClient(mongoUrl);
    client = await connectToDatabase();

    const db = client.db(dbName);
    const collection = db.collection('feedback');

    const feedbackText = req.body.feedback;

    console.log("feedback is " + feedbackText);
    await collection.insertOne({ feedback: feedbackText });
    res.status(200).send('Feedback submitted successfully');
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).send('Error submitting feedback');
  } finally {
    if (client) {
      console.log("now closing client");
      client.close();
    }
  }
});

app.get('/allFeedback', async function (req, res) {
  const client = new MongoClient(mongoUrl);
  await client.connect();

  try {
    const db = client.db(dbName);
    const collection = db.collection('feedback');
    const sessionData = await collection.find({}).toArray();
    res.json(sessionData);
  } catch (error) {
    console.error("Error retrieving session data:", error);
    res.status(500).json({ error: "Failed to retrieve session data" });
  } finally {
    client.close();
  }
});


app.listen(port, () => console.log(`Example app listening on port ${port}!`))