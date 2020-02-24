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
  // console.log(req.body, 'this is req body inside addCampground')
  // console.log(req.body.campground, 'this is campground inside addCampground')
  const { name, pets, sewer, water_hookup, waterfront, latitude, longitude } = req.body.campground; 
  // console.log(name, 'this is name')
  
  const text = `INSERT INTO "Campground" (name, pets, sewer, water_hookup, longitude, latitude, waterfront) VALUES ($1, $2, $3, $4, $5, $6, $7)`;
  const values = [name, pets, sewer, water_hookup, longitude, latitude, waterfront]; 

  db.query(text, values)
  .then((response) => {
     // res.locals.campId = response.
    return next();
  })
  .catch(err => {
    console.log('Error: ', err);
    return next(err);
  })

  const textTwo = `SELECT * FROM "Campground" WHERE name = $1`
  const valuesTwo = [name]

  db.query(textTwo, valuesTwo, (err, data) => {
    if(err){
      console.log(err, 'this is error')
      return next(err);
    } else if(data){
      console.log(data, 'this is data')
      return next();
    }
  })
  

}

// .then((response) => {
//   console.log(response, 'this is response from database after query is sent');
//   // res.locals.campid = response
//   return next();
// })
// .catch(err => {
//   console.log('Error: ', err);
//   return next(err); 
// })

userController.addFav = (req, res, next) => {
  const user = JSON.stringify(req.body.username);
  const campground = JSON.stringify(req.body.campground);

  const text = `INSERT INTO "Favorites" (Campground_id, user_id) VALUES ($1,$2)`;
  const values = [campground, user];

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

// userController.deleteFav = (req, res, next) => {

// }




module.exports = userController 
