const express = require('express')
const session = require('express-session')
const cors = require('cors')
const path = require('path')
const Twitter = require('twitter');
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const bcrypt = require('bcrypt');

//const MONGO_URL = 'mongodb:/autheneum:consensyshackathon2019@ds261116.mlab.com:61116/heroku_17b68d0w';
//const MONGO_DB = 'heroku_17b68d0w';
const MONGO_URL_DEV = 'mongodb://auth:consensys1@ds227570.mlab.com:27570/pcal-2018';
const MONGO_DB_DEV = 'pcal-2018';
// Create the server
const app = express()

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: "5ce9d00352073d3258d2ec1f",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, 'client/src')))

// Serve our api route /cow that returns a custom talking text cow
/*app.get('/api', cors(), async (req, res, next) => {

  MongoClient.connect(MONGO_URL_DEV, (err, client) => {
		if(err) { 
			throw err
		} else {
      console.log('Successfully connected to MongoDB')
      
      const db = client.db('pcal-2018');
      const coll = db.collection('assets');
      const arr  =[
        {"hash": "0x38306334373865353464303037653231346566313063653034396561376130626265653439343663656438616133646266366432363139343531366536373039", "author": "charl"},
        {"hash": "0x471904709579357902357029357023570293598549059023798259023750982334578625769592035925905497979757909292858429d2795497543970d29823", "author": "stefan"}
        ];
      coll.insert(arr).then((res)=>{
        console.log(res);
        return res.status(200);
      })

		}
  })

})*/
  
  app.get('/unity', async (req, res, next) => {
    if(req.query.api_key == '9a2dvh6nkm') {
      MongoClient.connect(MONGO_URL_DEV, (err, client) => {
        if(err) { 
          throw err
        } else {
          console.log('Successfully connected to MongoDB')
          
          const db = client.db('pcal-2018');
          const coll = db.collection('assets');
          coll.find({}).toArray(function(err, docs) {
            client.close();
            return res.json(docs);
          })
        }
      })
    } else {
      return res.json({
        respone: false,
        error: 'Wrong or no API key provided'
      })
    }
  })

app.post('/login', async (req,res)=>{
  const user = req.param('username');
  const password = req.param('password');
  const client = await MongoClient.connect(MONGO_URL_DEV);
  const db = await client.db('pcal-2018');
  const coll = await db.collection('users');
  const getuser = await coll.findOne({user});
  client.close();
  console.log(getuser);
  if(await bcrypt.compare(password, getuser.password)){
    //console.log(getuser);
    console.log('success')
    return res.json({response:'success'});
  }
  console.log('grrr')
  return res.json({response:'failure'});

})

app.post('/register', async (req,res)=>{
  const password = await bcrypt.hash(req.param('password'),10);
  const client = await MongoClient.connect(MONGO_URL_DEV);
  const db = await client.db('pcal-2018');
  const coll = await db.collection('users');
  const new_user = await coll.insertOne({
    user: req.param('username'),
    address: req.param('address'),
    display_name: req.param('addisplay_name'),
    password: password
  });
  client.close();

  return res.json(new_user.ops[0]);
})

app.post('/checksession',(req,res)=>{
  if(req.session.user == undefined || req.session.user == null){
    return res.json({response:true, user:req.session.user});
  } else {
    return res.json({response:false, user:null});
  }
})

app.get('/logout', (req, res) => {
  req.session = null;
  return res.redirect('/')
})

// Anything that doesn't match the above, send back the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/src/index.html'))
})

// Choose the port and start the server
const PORT = process.env.PORT || 3030
app.listen(PORT, () => {
  console.log(`Mixing it up on port ${PORT}`)
})