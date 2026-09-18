function isTableRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeTableRow(value: unknown): unknown {
  return isTableRecord(value) ? value : { Value: value };
}

export function normalizeConsoleTableData(data: unknown): unknown {
  if (Array.isArray(data)) {
    return data.map(normalizeTableRow);
  }

  if (isTableRecord(data)) {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        normalizeTableRow(value),
      ]),
    );
  }

  return data;
}
