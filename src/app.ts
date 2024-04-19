import express from 'express';

const app = express();

app.get('/', (req: any, res: any) => {
    res.send('welcome to auth service');
});

export default app;
