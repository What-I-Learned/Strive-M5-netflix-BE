const acceptedExtensions = ["jpg", "gif", "jpeg", "png"];
import createHttpError from "http-errors";
export const fileIsRequired = (req, res, next) => {
  const fileIsNotValid = !req.file;
  if (fileIsNotValid) {
    next(createError(400, `File is not sent`));
  } else {
    const [name, extension] = req.file.originalname.split(".");
    const extensionIsNotValid = !acceptedExtensions.includes(
      extension.toLowerCase()
    );
    if (extensionIsNotValid) {
      next(
        createHttpError(
          404,
          `Extension is not accepted , accepted files are only ${acceptedExtensions.join(
            ","
          )}`
        )
      );
    } else {
      next();
    }
  }
};
