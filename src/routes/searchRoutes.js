import express from "express";
import { getSearchSuggestions } from "../controllers/searchController.js";

const searchRouter = express.Router();

searchRouter.get("/suggestions", getSearchSuggestions);

export default searchRouter;
