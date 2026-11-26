/** Keep physical/logical repeat axes separate from shorthand resets. */
export function hasBackgroundRepeatOverlap(properties: readonly string[], repeatActive: boolean): boolean {
  const hasAxes = properties.some((property) => /^background-repeat-(?:x|y|block|inline)$/.test(property));
  const hasBackground = properties.includes("background");
  const hasRepeat = properties.includes("background-repeat");
  const hasLogicalAxes = properties.some((property) => /^background-repeat-(?:block|inline)$/.test(property));
  const hasPhysicalAxes = properties.some((property) => /^background-repeat-(?:x|y)$/.test(property));
  return (hasBackground && (hasAxes || (repeatActive && hasRepeat))) ||
    (hasRepeat && hasAxes) ||
    (hasLogicalAxes && hasPhysicalAxes);
}
