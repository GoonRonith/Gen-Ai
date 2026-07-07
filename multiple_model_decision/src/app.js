import express from 'express';
import chatRouter from './module/chat/chat.route.js';

const app = express()

app.use(express.json())

app.use('/api/v1',chatRouter)


app.get("/",(req,res) => {
    res.json({status:"running"})
})

export default app