import express from "express";
import multer from "multer";
import createError from "http-errors";
import uniqid from "uniqid";
import {
  getMedia,
  writeMedia,
  getReviews,
  writeReviews,
} from "../../lib/fs-tools.js";
import createHttpError from "http-errors";

const netflixRouter = express.Router();

//=============MEDIA

// CREATE
netflixRouter.post("/", async (req, res, next) => {
  try {
    const newMedia = { imdbID: uniqid(), ...req.body };
    const media = await getMedia();
    media.push(newMedia);
    await writeMedia(media);
    res.status(201).send({ imdbID: newMedia.imdbID });
  } catch (err) {
    next(createError(400, err.message));
  }
});

// GET ALL
netflixRouter.get("/", async (req, res, next) => {
  try {
    const reviews = await getReviews();
    const media = await getMedia();
    if (req.query && req.query.title) {
      const filteredMedia = media.filter(
        (movie) => movie.Title === req.query.title
      );
      res.send(filteredMedia);
    } else {
      const allTogether = { media, reviews };
      res.send(allTogether);
    }
  } catch (err) {
    next(err);
  }
});

// GET ONE
netflixRouter.get("/:imdbID", async (req, res, next) => {
  try {
    const media = await getMedia();
    const reviews = await getReviews();
    const mediaItem = media.find((m) => m.imdbID === req.params.imdbID);
    const mediaItemReviews = reviews.filter(
      (r) => r.elementId === mediaItem.imdbID
    );
    if (mediaItem) {
      const allTogether = { mediaItem, mediaItemReviews };
      res.send(allTogether);
    } else {
      next(
        createHttpError(
          404,
          `Media Item with id: ${req.params.imdbID} not found`
        )
      );
    }
  } catch (err) {
    next(err);
  }
});

// EDIT ONE
netflixRouter.put("/:imdbID", async (req, res, next) => {
  try {
    const media = await getMedia();
    const mediaItem = media.find((m) => m.imdbID === req.params.imdbID);

    if (!mediaItem) {
      next(
        createHttpError(
          404,
          `Media Item with id: ${req.params.imdbID} not found`
        )
      );
    } else {
      const mediaIndex = media.findIndex((m) => m.imdbID === req.params.imdbID);
      const mediaToModify = media[mediaIndex];
      const updatedFields = req.body;
      const updateMedia = { ...mediaToModify, ...updatedFields };
      media[mediaIndex] = updateMedia;
      await writeMedia(media);
      res.send(updateMedia);
    }
  } catch (err) {
    next(err);
  }
});

// DELETE ONE
netflixRouter.delete("/:imdbID", async (req, res, next) => {
  try {
    const media = await getMedia();
    const mediaItem = media.find((m) => m.imdbID === req.params.imdbID);
    if (!mediaItem) {
      next(
        createHttpError(
          404,
          `Media Item with id: ${req.params.imdbID} not found`
        )
      );
    } else {
      const filteredMedia = media.filter(
        (movie) => movie.imdbID !== req.params.imdbID
      );
      await writeMedia(filteredMedia);
      res.send("DELETED");
    }
  } catch (err) {
    next(err);
  }
});

// ============REVIEWS

// POST
netflixRouter.post("/:imdbID/reviews", async (req, res, next) => {
  try {
    const media = await getMedia();
    const mediaItem = media.find((m) => m.imdbID === req.params.imdbID);
    if (!mediaItem) {
      next(
        createHttpError(
          404,
          `Media Item with id: ${req.params.imdbID} not found`
        )
      );
    } else {
      const newReview = {
        _id: uniqid(),
        ...req.body,
        elementId: mediaItem.imdbID,
        createdAt: new Date(),
      };
      const reviews = await getReviews();
      reviews.push(newReview);
      await writeReviews(reviews);
      res.status(201).send({ id: newReview._id });
    }
  } catch (err) {
    next(err);
  }
});
// DELETE
netflixRouter.delete("/:imdbID/reviews/:reviewID", async (req, res, next) => {
  try {
    const reviews = await getReviews();
    const reviewItem = reviews.find((r) => r._id === req.params.reviewID);
    if (!reviewItem) {
      next(
        createHttpError(404, `Review with id: ${req.params.reviewID} not found`)
      );
    } else {
      const filteredReviews = reviews.filter(
        (review) => review._id !== req.params.reviewID
      );
      await writeMedia(filteredReviews);
      res.send("DELETED");
    }
  } catch (err) {
    next(err);
  }
});

// ==============POSTER
// POST POSTER
netflixRouter.post("/:imdbID/poster");

export default netflixRouter;
