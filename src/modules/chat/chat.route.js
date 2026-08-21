// src/modules/chat/chat.route.js
import express from "express";
import { sendMessage } from "./chat.controller.js";

const router = express.Router();

router.post("/message", sendMessage);

export default router;