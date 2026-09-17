export const COMPUTED_EXPORT_EXAMPLE_ID = "computed-export" as const;

/**
 * Representative of CSS copied from a computed-style/export workflow: a shorthand
 * is emitted together with the longhands that resolve to the same final values.
 */
export const COMPUTED_EXPORT_EXAMPLE = `[data-pb-export-id="0"] {
  position: relative;
  inset: auto;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
  display: flex;
  width: 80px;
  height: 88px;

  margin: 0px;
  margin-top: 0px;
  margin-right: 0px;
  margin-bottom: 0px;
  margin-left: 0px;

  padding: 0px 0px 8px;
  padding-top: 0px;
  padding-right: 0px;
  padding-bottom: 8px;
  padding-left: 0px;

  gap: normal;
  row-gap: normal;
  column-gap: normal;

  flex: 0 1 auto;
  flex-basis: auto;
  flex-direction: column;
  flex-grow: 0;
  flex-shrink: 1;
  flex-wrap: nowrap;

  align-items: center;
  justify-items: normal;
  place-items: center normal;

  border: 0px solid oklch(0.922 0 0);
  border-width: 0px;
  border-style: solid;
  border-color: oklch(0.922 0 0);
  border-top-width: 0px;
  border-right-width: 0px;
  border-bottom-width: 0px;
  border-left-width: 0px;
  border-top-style: solid;
  border-right-style: solid;
  border-bottom-style: solid;
  border-left-style: solid;
  border-top-color: oklch(0.922 0 0);
  border-right-color: oklch(0.922 0 0);
  border-bottom-color: oklch(0.922 0 0);
  border-left-color: oklch(0.922 0 0);

  border-radius: 0px;
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
  border-bottom-right-radius: 0px;
  border-bottom-left-radius: 0px;

  background: none;
  background-color: rgba(0, 0, 0, 0);
  background-image: none;
  background-position: 0% 0%;
  background-repeat: repeat;
  background-size: auto;

  transition: all;
  transition-property: all;
  transition-duration: 0s;
  transition-timing-function: ease;

  animation: none;
  animation-name: none;
  animation-duration: 0s;
  animation-delay: 0s;
  animation-timing-function: ease;
  animation-iteration-count: 1;
  animation-direction: normal;
  animation-fill-mode: none;
  animation-play-state: running;
}`;
