import fs from "fs-extra";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const { readJSON, writeJSON, writeFile } = fs;
const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../data");

const mediaJSONPath = join(dataFolderPath, "media.json");
const reviewsJSONPath = join(dataFolderPath, "reviews.json");

export const getMedia = () => readJSON(mediaJSONPath);
export const writeMedia = (content) => writeJSON(mediaJSONPath, content);
export const getReviews = () => readJSON(reviewsJSONPath);
export const writeReviews = (content) => writeJSON(reviewsJSONPath, content);
