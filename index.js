const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const config = require('./config/key')
const app = express()
const port = 8000

// body-parser에 옵션을 조금 줘야함.
// body-parser가 client에서 오는 정보를 서버에서 분석해서 가져올 수 있게 해주는것.
// application/x-www-form-urlencoded 타입을 분석해서 가져옴
app.use(bodyParser.urlencoded({extended: true}));
// application/json 타입을 분석해서 가져옴
app.use(bodyParser.json());

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

app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})