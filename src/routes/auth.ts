import express from 'express';
import { AuthController } from '../controllers/AuthController';

const authController = new AuthController();

const router = express.Router();

router.post('/register', (req, res) => {
    authController.register(req, res);
});

export default router;
