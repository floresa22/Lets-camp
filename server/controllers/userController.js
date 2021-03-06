const fetch  = require('node-fetch');
const userController = {};
const db = require('../index.js')

const api_key = process.env.API_KEY;


userController.login = async (req, res, next) => {
  const user = req.body.username;
  const password = req.body.password;

  const text = `SELECT * FROM "user" WHERE username = $1`
  const values = [user];


  await db.query(text,values, (err, data) => {
    if(err) {
        console.log(err);
        return next(err)
    }
    else {
      if(data.rows[0].password !== password) {
        console.log('password did not match')
        return next(err)
      }
      else {
        res.locals.user = data.rows[0]
        console.log(res.locals, 'this is locals inside login middleware')
        return next()
      }
    }
  })
}


userController.deleteUser = (req, res, next) => {
  const user = JSON.stringify(req.body.username);

  const text = `DELETE FROM "user" WHERE username = $1`
  const value = [user]

  db.query(text, value, (err, data) => {
    if(err){
      console.log(err);
      return next(err);
    }
    else {
      if(!data){
        return next(err);
      }
      return next();
    }
  })
}


userController.createUser = (req, res, next) => {
  const user = JSON.stringify(req.body.username);
  const password = JSON.stringify(req.body.password);

  const text = `INSERT INTO "user" (username, password, loggedin) VALUES ($1, $2, $3)`;
  const values = [user, password, true];

  db.query(text,values)
  .then((response) => {
    console.log('res in login: ', response);
    res.locals.user = response.rows;
    return next();
  })
  .catch(err => {
    console.log('Error: ', err);
    return next(err)
  }) 
}

userController.addCampground = (req, res, next) => {
  const { name, pets, sewer, water_hookup, waterfront, latitude, longitude } = req.body.campground; 
  
  const text = `INSERT INTO "Campground" (name, pets, sewer, water_hookup, longitude, latitude, waterfront) VALUES ($1, $2, $3, $4, $5, $6, $7)`;
  const values = [name, pets, sewer, water_hookup, longitude, latitude, waterfront]; 

  db.query(text, values)
  .then((response) => {
    return next();
  })
  .catch(err => {
    console.log('Error: ', err);
    return next(err);
  })
}

userController.getCampground = async (req, res, next) => {
  const { name } = req.body.campground; 

  const text = `SELECT * FROM "Campground" WHERE name = $1`;
  const value = [name];

  await db.query(text, value, (err, data) => {
    if(err){
      console.log(err, 'this is error');
      return next(err);
    } else if(!data){
      console.log('data is incorrect');
      return next(err)
    } else {
      console.log(data.rows[0].Campground_id, 'this is the campgrounds id that was just created')
      res.locals.campId = data.rows[0].Campground_id;
      return next();
    }
  })
}



userController.addFav = (req, res, next) => {
  const userId = req.body.userId;
  const campgroundId = res.locals.campId;
  // console.log(userId, 'this is secondUser inside of add fav')
  console.log(campgroundId, 'this is campground id inside addFav middleware')

  const text = `INSERT INTO "Favorites" (Campground_id, user_id) VALUES ($1,$2)`;
  const values = [campgroundId, user];

  db.query(text,values)
  .then((response) => {
    return next();
  })
  .catch(err => {
    console.log('Error: ',err);
    return next(err)
  });
};


userController.getFav = (req, res, next) => {
  const userId = JSON.stringify(req.body.username);

  const text = `SELECT * FROM campground WHERE campground_id in
  (
  select campground_id from favorites where user_id = $1
  )`;

  const value = [userId];

  db.query(text,value)
  .then((response) => {
    res.locals.user = response.rows;
    return next();
  })
  .catch(err => {
    console.log('Error: ', err);
    return next(err)
  }) 
}




module.exports = userController 
