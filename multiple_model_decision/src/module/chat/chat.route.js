import { Router } from "express";
import { ChatController } from "./chat.controller.js";

const chatController = new ChatController()
const chatRouter = Router()

chatRouter.post('/chat',chatController.handlePostChatController.bind(chatController))

export default chatRouter