const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const config = require('./config/key')
const app = express()
const port = 8000

// body-parser에 옵션을 조금 줘야함.
// body-parser가 client에서 오는 정보를 서버에서 분석해서 가져올 수 있게 해주는것.
// application/x-www-form-urlencoded 타입을 분석해서 가져옴
app.use(bodyParser.urlencoded({extended: true}));
// application/json 타입을 분석해서 가져옴
app.use(bodyParser.json());

//이게 있어야 쿠키파서를 사용할 수 있음.
app.use(cookieParser());

const {User} = require("./models/User");

mongoose.connect(config.mongoURI,{
}).then(()=> console.log('mongoDB is connected...'))
    .catch(err=>console.log(err))

app.get('/', (req, res) => {
  res.send('Hello universe!')
})

app.post('/register', (req, res) => {
  // 회원가입 할 때 필요한 정보들을 client에서 가져오면
  // 그것을 DB에 넣어준다. 이렇게 하기위해선 저번에 만든 user 모델을 가져와야한다.

  // 이 정보들을 DB에 넣으려면 req.body를 넣으면 되는데 이게 뭐냐면 json 형태로 들어있는 건데 이를 가능하게 해주는게 뭐라고? 바로 body-parser라고
  const user = new User(req.body)

  // 무튼 그래서 save는 몽고DB함수이고 
  user.save((err, userInfo)=>{
    if(err)return res.json({ success: false, err})
    return res.status(200).json({
      success:true
    })
  })
})
// method 짜는 원리가 궁금함 
app.post('/login', (req, res)=>{
  // 1. 요청된 이메일을 DB에서 있는지 찾는다.
  // findOne은 어디서 나온거지? => 몽고DB에서 나온 함수임
  User.findOne({ email:req.body.email}, (err, user) =>{
    if(!user){
      return res.json({
        loginSuccess : false,
        message : "제공된 이메일에 해당하는 유저가 없습니다."
      })
    }
    // 요청된 이메일을 DB에 있다면 맞는 pw인지 확인한다. 이때 2가지 인자를 넣는데 1는 사용자가 입력한 값 나머지 1은 콜백 함수
    // 이렇게 없는 함수를 만들 땐 user model에 method를 만들어서 올려놓으면 된다. 즉, 우선순위는 con부분부터 만들어줘야함
    user.comparePassword(req.body.password, (err, isMatch)=>{
      if(!isMatch) return res.json({loginSuccess:false, message:"비번이 틀렸음"})

      // 비밀번호까지 맞다면 token 생성한다.
      user.generateToken((err, user)=>{
        if(err) return res.status(400).send(err); 
        // 토큰을 저장한다 어디에? user에 저장되어있는 것을 어느 scope에 저장시켜야함 일단 쿠키에 저장히켜보겠음
        // 그런데 cookie parser라는 lib이 또 필요함 그래서 일단 설치하겠음
        res.cookie("x_auth", user.token)
        .status(200)
        .json({loginSuccess:true, userId: user._id})
        // 질문 loginSuccess는 어디서 나온것 인가? => json 형태니까 내가 그냥 지정한거임
        // model인 user단에서의 generateToken 함수와 cotroller인 generateToken 함수의 차이 => 함수 정의는 user단 함수활용은 index에서
      })
    })
  })
})

app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})