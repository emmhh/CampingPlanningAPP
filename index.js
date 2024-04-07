const express = require("express");
const { MongoClient } = require("mongodb");
const path = require("path");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'forecast.html'));
});

// Serve static files from the "public" directory
app.use(express.static("public"));

// Middleware
app.use(express.json()); // for parsing application/json

// MongoDB connection string
const mongoUrl = process.env.MONGODB_URI;

// Connect to MongoDB
// const client = new MongoClient(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
const client = new MongoClient(mongoUrl);

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Could not connect to MongoDB", error);
  }
}

connectToDatabase();
const dbName = "yourDatabaseName";
const collectionName = "yourCollectionName";
const weatherDB = "INFSCI2711";
const weatherName = "WeatherData";

//connect mongoDB via API
const atlasAPIEndpoint = 'https://us-east-2.aws.data.mongodb-api.com/app/data-atbre/endpoint/data/v1';
const atlasAPIKey = process.env.ATLAS_API_KEY;
const clusterName = 'INFSCI2560';

app.get("/data", async (req, res) => {
  const collection = client.db(dbName).collection(collectionName); // Make sure you have this line here
  try {
    const result = await collection.find().sort({ _id: -1 }).toArray();
    res.json(result); // Since limit(1) will return an array with one item
  } catch (error) {
    res.status(500).send(error.message);
  }
});


//fetch weather from mongodb
app.get('/weather', async (req, res) => {
    const collection = client.db(weatherDB).collection(weatherName); // Make sure you have this line here
    //add filter button
    const zipCode = req.query.zip; // Get the ZIP code from query parameters
    
    let query = {};
    if (zipCode) {
        query["address"] = zipCode; // Filter by the ZIP code in the address field
    }
    //add filter button
    
    try {
        //add filter button
        const result = await collection.find(query).toArray();

        //const result = await collection.find().toArray(); // Convert cursor to an array
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching from MongoDB:', error);
        res.status(500).send(error.message);
    }
});


// Other routes and middleware...
app.get("/forecast", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "forecast.html"));
});

app.get("/api.data", async (req, res) => {
  const headers = {
    "Content-Type": "application/json",
    "api-key": atlasAPIKey,
  };

  const body = {
    dataSource: clusterName,
    database: dbName,
    collection: collectionName,
    filter: {}, // Modify if you want to filter the results
  };

  try {
    const endPointFunction = "/action/find";
    //call API
    const apiResponse = await fetch(atlasAPIEndpoint + endPointFunction, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    });
    const data = await apiResponse.json();
    res.send(data.documents); // Send the data to the client
  } catch (error) {
    console.error("Error fetching data from Atlas API:", error);
    res.status(500).send("Error fetching data");
  }
});

// Other routes and middleware...
app.get('/forecast', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'forecast.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
