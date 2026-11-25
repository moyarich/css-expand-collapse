// Decode standard source-map VLQ segments independently of the generator.
export function originalAt(mappings: string, column: number): [number, number] | undefined {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let source = 0;
  let originalLine = 0;
  let originalColumn = 0;
  let generatedColumn = 0;
  let match: [number, number] | undefined;
  for (const segment of (mappings.split(";")[0] ?? "").split(",")) {
    if (!segment) continue;
    const values: number[] = [];
    let value = 0;
    let shift = 0;
    for (const character of segment) {
      const digit = alphabet.indexOf(character);
      value += (digit & 31) * 2 ** shift;
      if (digit & 32) {
        shift += 5;
      } else {
        values.push(value & 1 ? -(value >> 1) : value >> 1);
        value = 0;
        shift = 0;
      }
    }
    generatedColumn += values[0]!;
    if (generatedColumn > column) break;
    if (values.length >= 4) {
      source += values[1]!;
      originalLine += values[2]!;
      originalColumn += values[3]!;
      match = source === 0 ? [originalLine, originalColumn] : undefined;
    } else {
      match = undefined;
    }
  }
  return match;
}
