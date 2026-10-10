import { splitTopLevelWhitespace } from "@moyarich/css-expand-collapse";

// Split only top-level CSS whitespace. Spaces inside functions and quoted
// strings stay intact, which is useful when tokenizing compound CSS values.
const tokens = splitTopLevelWhitespace(
  'calc(100% - 2rem) "hello world" center',
);

console.log(tokens);
