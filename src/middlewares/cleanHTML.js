import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";

const window = new JSDOM("").window;
const purify = DOMPurify(window);
export const cleanHTML = (content) => {
  const clean = purify.sanitize(content, {
    ALLOWED_TAGS: [
      "p",
      "span",
      "style",
      "u",
      "strong",
      "em",
      "s",
      "ul",
      "ol",
      "li",
    ],
  });
  return clean;
};
