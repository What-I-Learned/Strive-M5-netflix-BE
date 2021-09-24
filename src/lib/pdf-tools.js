import PdfPrinter from "pdfmake";
import imageToBase64 from "image-to-base64";

export const getPDFReadableStream = async (mediaItem, comments) => {
  const fonts = {
    Roboto: {
      normal: "Helvetica",
      bold: "Helvetica-Bold",
      // italics: "fonts/Roboto-Italic.ttf",
      // bolditalics: "fonts/Roboto-MediumItalic.ttf",
    },
  };
  const { Title, Year, Type, Poster } = mediaItem;
  const { Comment, Rate } = comments;

  let imagePart = {};
  const mediaPosterURLParts = Poster.split("/");
  const fileName = mediaPosterURLParts[mediaPosterURLParts.length - 1];
  const [id, extension] = fileName.split(".");
  console.log(fileName, extension);
  try {
    const response = await imageToBase64(Poster);

    const base64Image = `data:image/${extension};base64,${response}`;
    imagePart = { image: base64Image, width: 500, margin: [0, 0, 0, 40] };
  } catch (err) {
    console.log(err);
  }

  const printer = new PdfPrinter(fonts);

  const docDefinition = {
    content: [
      imagePart,
      { text: Title, fontSize: 20, bold: true, margin: [0, 0, 0, 40] },
    ],
  };

  const options = {
    // ...
  };

  const pdfReadableStream = printer.createPdfKitDocument(docDefinition);
  pdfReadableStream.end();
  return pdfReadableStream;
};
