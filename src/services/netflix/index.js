import express from "express";
import uniqid from "uniqid";
import {
  getMedia,
  writeMedia,
  getReviews,
  writeReviews,
} from "../../lib/fs-tools.js";
import createHttpError from "http-errors";
import { imageUpload } from "../../lib/multerTools.js";
import { fileIsRequired } from "../../middlewares/fileIsRequired.js";
import {
  addMediaItemValidation,
  addReviewValidation,
} from "../../middlewares/validation/validators.js";
import { validationResult } from "express-validator";
import { getPDFReadableStream } from "../../lib/pdf-tools.js";
import { pipeline } from "stream";

const netflixRouter = express.Router();

//=============MEDIA

// CREATE
netflixRouter.post("/", addMediaItemValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      next(
        createHttpError(400, {
          message: "Add new Media Item validation has failed",
          errors: errors.array(),
        })
      );
    } else {
      const newMedia = { imdbID: uniqid(), ...req.body };
      const media = await getMedia();
      media.push(newMedia);
      await writeMedia(media);
      res.status(201).send({ imdbID: newMedia.imdbID });
    }
  } catch (err) {
    next(createHttpError(400, err.message));
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
      const allTogether = [{ media: [...media] }, { reviews: [...reviews] }];
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

    const mediaItem = media.find((m) => m.imdbID === req.params.imdbID);

    if (mediaItem) {
      const reviews = await getReviews();
      const mediaItemReviews = reviews.filter(
        (r) => r.elementId === mediaItem.imdbID
      );
      const allTogether = [
        { mediaItem: mediaItem },
        { comments: [...mediaItemReviews] },
      ];
      const { Poster, Title } = mediaItem;
      console.log(Title);
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
netflixRouter.put(
  "/:imdbID",
  addMediaItemValidation,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        next(
          createHttpError(400, {
            message: "Edit Media Item validation has failed",
            errors: errors.array(),
          })
        );
      } else {
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
          const mediaIndex = media.findIndex(
            (m) => m.imdbID === req.params.imdbID
          );
          const mediaToModify = media[mediaIndex];
          const updatedFields = req.body;
          const updateMedia = { ...mediaToModify, ...updatedFields };
          media[mediaIndex] = updateMedia;
          await writeMedia(media);
          res.send(updateMedia);
        }
      }
    } catch (err) {
      next(err);
    }
  }
);

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
netflixRouter.post(
  "/:imdbID/reviews",
  addReviewValidation,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        next(
          createHttpError(400, {
            message: "Add new Review validation has failed",
            errors: errors.array(),
          })
        );
      } else {
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
      }
    } catch (err) {
      next(err);
    }
  }
);
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
netflixRouter.post(
  "/:imdbID/poster",
  imageUpload.single("poster"),
  fileIsRequired,
  async (req, res, next) => {
    try {
      if (!errors.isEmpty()) {
        next(
          createHttpError(400, {
            message: "Add new Media Item validation has failed",
            errors: errors.array(),
          })
        );
      } else {
        const media = await getMedia();
        const mediaItem = media.find((m) => m.imdbID === req.params.imdbID);
        if (!mediaItem) {
          next(
            createHttpError(
              404,
              `Media with id: ${req.params.imdbID} not found`
            )
          );
        } else {
          mediaItem["Poster"] = req.file.path;
          await writeMedia(media);
          res.send("image uploaded on cloudinary");
        }
      }
    } catch (err) {
      next(err);
    }
  }
);

// ==============PDF
// GET PDF
netflixRouter.get("/:imdbID/pdf", async (req, res, next) => {
  try {
    const media = await getMedia();

    const mediaItem = media.find((m) => m.imdbID === req.params.imdbID);
    if (mediaItem) {
      const reviews = await getReviews();
      const mediaItemReviews = reviews.filter(
        (r) => r.elementId === mediaItem.imdbID
      );
      const source = await getPDFReadableStream(mediaItem, mediaItemReviews);
      res.setHeader("Content-Type", "application/pdf");
      const destination = res;

      pipeline(source, destination, (err) => {
        if (err) next(err);
      });
    } else {
      next(
        createHttpError(
          404,
          "Media Item with id " + req.params.imdbID + " was not found"
        )
      );
    }
  } catch (err) {
    next(err);
  }
});

export default netflixRouter;
