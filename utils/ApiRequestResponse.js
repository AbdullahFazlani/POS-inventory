import { StatusCodes } from "http-status-codes";

export const errorResponse = (res, message, statusCode, payload) => {
  return res
    .status(statusCode ?? StatusCodes.BAD_REQUEST)
    .json({ status: "error", message: message, data: payload });
};

export const successResponce = (res, message, statusCode, payload) => {
  return res
    .status(statusCode ?? StatusCodes.BAD_REQUEST)
    .json({ status: "success", message: message, data: payload });
};
