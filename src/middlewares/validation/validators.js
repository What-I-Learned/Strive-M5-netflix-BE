import { body } from "express-validator";

export const addMediaItemValidation = [
  body("Title").exists().withMessage("Title is required"),
  body("Year").exists().withMessage("Year is required"),
  body("Type").exists().withMessage("Type is required"),
];

export const addReviewValidation = [
  body("comment").exists().withMessage("Comment is required"),
  body("rate")
    .exists()
    .isInt({ min: 0, max: 5 })
    .withMessage("Rate is required and must be between 0 and 5"),
];
