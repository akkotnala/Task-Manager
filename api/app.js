const express = require('express');
const app = express();
const mongoose =require('./db/mongoose');
const bodyParser = require('body-parser');

// Load in the mongoose models
const { List, Task, User } = require('./db/models');
const jwt = require('jsonwebtoken');

/** MIDDLEWARE */


//load middleware
app.use(bodyParser.json());


//core header enabled
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Expose-Headers","x-access-token, x-refresh-token");    
    res.header("Access-Control-Allow-Headers", "x-access-token,x-refresh-token,Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, _id");


    
    next();
  });

  // check if the request is valid or not
  let authenticate = (req,res, next) => {
      let token = req.header('x-access-token');

      //verify jwt
      jwt.verify(token, User.getJWTSecret(), (err,decoded)=>{
        if (err){
            //if error don't auth
            res.status(401).send(err);
        }else{
            //jwt is valid
            req.user_id =decoded._id;
            next();
        }
      })
  }

  // Verify Refresh Token Middleware (which will be verifying the session)
let verifySession = (req, res, next) => {
    // grab the refresh token from the request header
    let refreshToken = req.header('x-refresh-token');

    // grab the _id from the request header
    let _id = req.header('_id');

    User.findByIdAndToken(_id, refreshToken).then((user) => {
        if (!user) {
            // user couldn't be found
            return Promise.reject({
                'error': 'User not found. Make sure that the refresh token and user id are correct'
            });
        }


        // if the code reaches here - the user was found
        // therefore the refresh token exists in the database - but we still have to check if it has expired or not

        req.user_id = user._id;
        req.userObject = user;
        req.refreshToken = refreshToken;

        let isSessionValid = false;

        user.sessions.forEach((session) => {
            if (session.token === refreshToken) {
                // check if the session has expired
                if (User.hasRefreshTokenExpired(session.expiresAt) === false) {
                    // refresh token has not expired
                    isSessionValid = true;
                }
            }
        });

        if (isSessionValid) {
            // the session is VALID - call next() to continue with processing this web request
            next();
        } else {
            // the session is not valid
            return Promise.reject({
                'error': 'Refresh token has expired or the session is invalid'
            })
        }

    }).catch((e) => {
        res.status(401).send(e);
    })
}

/* END MIDDLEWARE  */

  
/* Router Handlers */


/* List Router */

/*get /lists
 *purpose: Get lists
 */
app.get('/lists', authenticate, (req,res)=>{
    // res.send("hello world!");
    // array of list that belong to the auth user
    List.find({
        _userId: req.user_id
    }).then((lists)=> {
        res.send(lists);
    }).catch((e)=>{
        res.send(e);
    })
});

/* post /lists
 * purpose: create a list
 */
app.post('/lists',authenticate, (req,res) => {
    //create new list and return list
    // list will be passed via json data
    let title = req.body.title;

    let newList = new List({
        title,
        _userId: req.user_id
    });

    newList.save().then((listDoc) => {
        //full list document is requried
        res.send(listDoc);
    })
});

/* patch /lists
 * purpose: update a list
 */
app.patch('/lists/:id', authenticate, (req,res)=>{
    //update list
    List.findOneAndUpdate({_id: req.params.id, _userId: req.user_id},{
        $set: req.body
    }).then(() =>{
        res.send({'message': 'updated successfully'});
    })
});

/* delete /list
 * purpose: delete a selected list
 */
app.delete('/lists/:id', authenticate, (req,res)=>{
    //delete the list
    List.findOneAndRemove({
        _id: req.params.id,
        _userId: req.user_id
    }).then((removedListDoc) => {
        res.send(removedListDoc);
        
        //delete the that are in a deleted list
        deleteTasksFromList(removedListDoc._id);

    })
});

app.get('/lists/:listId/tasks', authenticate, (req,res) =>{
    //we want to return all tasks that belong to a specific lists
    Task.find({
        _listId: req.params.listId
    }).then((tasks) =>{
        res.send(tasks);
    })
});

app.post('/lists/:listId/tasks', authenticate, (req,res) =>{
    //create new task in tasks
    List.findOne({
        _id: req.params.listId,
        _userId: req.user_id
    }).then((list)=>{
        if(list){
            //if valid user
            return true;
        }
        return false;
    }).then((canCreateTask)=>{
        if(canCreateTask){           
            let newTask = new Task({
                title: req.body.title,
                _listId: req.params.listId
            });
            newTask.save().then((newTaskDoc) =>{
                res.send(newTaskDoc);
            })
        }else{
            res.sendStatus(404);
        }
    })
});

/* patch /lists/listId/task/taskId
*/

app.patch('/lists/:listId/tasks/:taskId', authenticate, (req,res)=>{
    //update task in list

    List.findOne({
        _id: req.params.listId,
        _userId: req.user_id
    }).then((list)=>{
        if(list){
            //if valid user
            //can update the tasks
            return true;
        }
        return false;
    }).then((canUpdateTasks)=>{
        if(canUpdateTasks){
            Task.findOneAndUpdate({
                _id: req.params.taskId,
                _listId: req.params.listId
            }, {
                 $set: req.body
                }).then(() =>{
                    res.send({message: "updated successfully"});
            })
        }else{
            res.sendStatus(404);
        }
    })
    
});

/* delete /lists/listId/task/taskId
* delete a specific task
*/

app.delete('/lists/:listId/tasks/:taskId', authenticate, (req,res)=>{
    //delete the task within the list
    List.findOne({
        _id: req.params.listId,
        _userId: req.user_id
    }).then((list)=>{
        if(list){
            //if valid user
            // can delete the tasks
            return true;
        }
        return false;
    }).then((canDeleteTasks)=>{
        if(canDeleteTasks){Task.findOneAndRemove({
            _id: req.params.taskId,
            _listId: req.params.listId
        }).then((removedTaskDoc) => {
            res.send(removedTaskDoc);
        })
        }else{
            res.sendStatus(404);
        }
    }) 
});

// app.get('/lists/:listId/tasks/:taskId', (req,res)=>{
//     Task.findOne({
//         _id: req.params.taskId,
//         _listId: req.params.listId
//     }).then((task)=>{
//     res.send(task);
//     })
// });


/* USER ROUTES */

/**
 * POST /users
 * Purpose: Sign up
 */app.post('/users', (req, res) => {
    // User sign up

    let body = req.body;
    let newUser = new User(body);

    newUser.save().then(() => {
        return newUser.createSession();
    }).then((refreshToken) => {
        // Session created successfully - refreshToken returned.
        // now we geneate an access auth token for the user

        return newUser.generateAccessAuthToken().then((accessToken) => {
            // access auth token generated successfully, now we return an object containing the auth tokens
            return { accessToken, refreshToken }
        });
    }).then((authTokens) => {
        // Now we construct and send the response to the user with their auth tokens in the header and the user object in the body
        res
            .header('x-refresh-token', authTokens.refreshToken)
            .header('x-access-token', authTokens.accessToken)
            .send(newUser);
    }).catch((e) => {
        res.status(400).send(e);
    })
})


/**
 * POST /users/login
 * Purpose: Login
 */
app.post('/users/login', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    User.findByCredentials(email, password).then((user) => {
        return user.createSession().then((refreshToken) => {
            // Session created successfully - refreshToken returned.
            // now we geneate an access auth token for the user

            return user.generateAccessAuthToken().then((accessToken) => {
                // access auth token generated successfully, now we return an object containing the auth tokens
                return { accessToken, refreshToken }
            });
        }).then((authTokens) => {
            // Now we construct and send the response to the user with their auth tokens in the header and the user object in the body
            res
                .header('x-refresh-token', authTokens.refreshToken)
                .header('x-access-token', authTokens.accessToken)
                .send(user);
        })
    }).catch((e) => {
        res.status(400).send(e);
    });
})

/**
 * DELETE /users/session
 * Purpose: Logout (Delete a session from the database)
 */
app.delete('/users/session', verifySession, (req, res) => {
    let userId = req.userId;
    let refreshToken = req.refreshToken; // this is the token we have to invalidate
    User.findOneAndUpdate({
        _id: userId
    }, {
        $pull: {
            sessions: {
                token: refreshToken
            }
        }
    }).then(() => {
        console.log("REMOVED SESSION");
        res.send();
    })
})

/**
 * GET /users/me/access-token
 * Purpose: generates and returns an access token
 */
app.get('/users/me/access-token', verifySession, (req, res) => {
    // the user is authenticated and we have the user_id and user object available to us
    req.userObject.generateAccessAuthToken().then((accessToken) => {
        res.header('x-access-token', accessToken).send({ accessToken });
    }).catch((e) => {
        res.status(400).send(e);
    });
})

/**
 * helper
 */
let deleteTasksFromList = (_listId)=>{
    task.deleteMany({
        _listId
    }).then(()=>{
        console.log("Tasks from " + _listId +" were deleted")
    })
}

app.listen(3000, () =>{
    console.log("server is listening on port 3000");
})