const express = require('express')
const mongoose = require('mongoose')
const app = express()
const port = 8000

mongoose.connect('mongodb+srv://zzangkbc1:rkdWJDdn12@atlascluster.bykewjb.mongodb.net/?retryWrites=true&w=majority',{
}).then(()=> console.log('mongoDB is connected...'))
    .catch(err=>console.log(err))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})