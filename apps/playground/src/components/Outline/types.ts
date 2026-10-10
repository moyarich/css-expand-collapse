export interface TocEntry {
  value: string;
  depth: number;
  id?: string;
  children?: TocEntry[];
}
