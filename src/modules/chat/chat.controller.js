import * as chatService from "./chat.service.js";

export const sendMessage = async (req, res, next) => {
  try {
    const { history, message, comparisonResult } = req.body;
    
    const result = await chatService.chat(history, message, comparisonResult);

    res.status(200).json({
      success: true,
      message: "Reply generated",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};