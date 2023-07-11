import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/database';

dotenv.config();
const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port - ${process.env.PORT}`);
})