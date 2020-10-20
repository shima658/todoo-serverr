const dbTodo = require('../models/Todo');
const dbUser = require('../models/User');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const salt = "ertfyguh";
const jwtSecret = "verysecretoken";

const getTodos = ()=>{
    return dbTodo.Todo.find();
}

const getTodo = (id)=>{
    return dbTodo.Todo.findOne({_id:id});
}

const createTodo = (data)=>{
    const todo = new dbTodo.Todo(data);
    todo.save();
    return {
        statusCode:200,
        message:"Todo created successfully"
    }
}
const verifyToken = (bearerToken, req,res, next)=>{
    jwt.verify(bearerToken, jwtSecret, function(err, decoded){
        if(err){
            res.status(401).json({message:"Invalid token"});
        }else{
            req.user_id = decoded.id;
            next();
        }
    })
}
const login = (data)=>{
    console.log(data);
    return dbUser.User.findOne({email:data.email})
    .then(user=>{
        if(!user){
            return {
                statusCode:422,
                message:"Invalid credentials"
            }
        }
        const hash = generateHash(data.password);
        if(hash==user.password){
            const token = jwt.sign({id:user._id},jwtSecret)
            return {
                token, 
                statusCode:200,
                message:"Logged In"
            }
        }else{
            return {
                statusCode:422,
                message:"Invalid credentials"
            }
        }

    })
}
const generateHash = (password)=>{
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash;
}
const createUser = (data)=>{
    return dbUser.User.findOne({email:data.email})
    .then(user=>{
        if(user){
            return {
                statusCode:422,
                message:"User already exists"
            }
        }
        const hash = generateHash(data.password);
        data.password = hash;
        const newUser = new dbUser.User(data);
        newUser.save();
        return {
            statusCode:200,
            message:"User created successfully"
        }
    })
}

const updateTodo = (id, data)=>{
    return dbTodo.Todo.findOneAndUpdate({
        _id:id
    },data);
}
const deleteTodo = (id)=>{
    return dbTodo.Todo.deleteOne({
        _id:id
    });
}

module.exports = {
    createTodo,
    getTodos,
    createUser,
    login,
    verifyToken,
    updateTodo,
    deleteTodo,
    getTodo
}