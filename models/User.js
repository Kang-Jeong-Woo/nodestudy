const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const saltRounds = 10;

const userSchema = mongoose.Schema({
    name:{
        type : String,
        maxlength : 50
    },
    email:{
        type: String,
        trim : true,
        unique : 1
    },
    password:{
        type:String,
        minlength : 5
    },
    lastname:{
        type : String,
        maxlength : 50
    },
    role:{
        type: Number,
        default:0
    },
    image:String,
    token:{
        type:String
    },
    tokenExp:{
        type:Number
    }
})

// 몽구스 method pre => ~전에
userSchema.pre('save', function(next){
    var user = this;
    // 뭐 할때마다 pw를 암호화하는 것이 아닌 pw를 바꾼다고 할 때만 pw를 암호화해주어야한다.
    if(user.isModified('password')){
        // 비밀번호를 암호화 시킨다.
        bcrypt.genSalt(saltRounds, function(err, salt) {
            if(err) return next(err)
            bcrypt.hash(user.password, salt, function(err, hash) {
                // Store hash in your password DB.
                if(err) return next(err)
                user.password = hash
                next()
            });
        });
    } else {
        // 이 else 구문이 있어야 if 문이 아닐때 이더라도 빠져나올 수 있다.
        next()
    }
})

userSchema.methods.comparePassword = function(plainPassword, cb){
    // 여기까지 왔으면 지금 사용자가 입력한 값과 암호화된 비밀번호가 같은지 확인해야한다. 
    // 이때 암호화된 pw를 복호화할 수 없기에 사용자가 입력한 값을 다시 암호화하여 DB에 저장된 pw와 일차하는지 확인해야한다.
    bcrypt.compare(plainPassword, this.password, function(err, isMatch){
        if(err) return cb(err);
        cb(null, isMatch)
        // 여까지 하면 이제 다시 index.js로 감. 즉 isMatch는 boolean 값임
    })
}

userSchema.methods.generateToken = function(cb) {
    // jsonwebtoken을 사용하여 token 생성
    var user = this;
    var token = jwt.sign(user._id.toHexString(), 'secretToken');
    user.token = token
    user.save(function(err, user){
        if(err) return cb(err);
        cb(null, user)
    })
    // user.save 라는 method가 어디서 나온거임?
}

const User = mongoose.model('User', userSchema)

module.exports = {User}