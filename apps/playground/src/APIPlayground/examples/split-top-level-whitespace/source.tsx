import { splitTopLevelWhitespace } from "@moyarich/css-expand-collapse";

console.log(
  splitTopLevelWhitespace('calc(100% - 2rem) "hello world" center'),
);
