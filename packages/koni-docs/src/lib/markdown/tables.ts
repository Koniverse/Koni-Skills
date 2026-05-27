import type { Root, Table, TableRow, TableCell, Content } from 'mdast';
import { toString as nodeToString } from 'mdast-util-to-string';
import { findSection } from './sections.ts';
import type { Doc } from '../types.ts';

export interface TableLocator {
  inSection?: string;
  afterHeading?: string;
}

export interface ParsedTable {
  headers: string[];
  rows: string[][];
  /** Reference to the mdast Table node — mutations on `node` mutate `doc.ast`. */
  node: Table;
}

export interface RowMatcher {
  column: string;
  value: string | RegExp;
}

export function findTable(doc: Doc, opts: TableLocator): Table | null {
  let searchSpace: Content[] = doc.ast.children as Content[];
  if (opts.inSection) {
    const sec = findSection(doc, opts.inSection);
    if (!sec) return null;
    searchSpace = sec.body;
  }
  for (const node of searchSpace) {
    if (node.type === 'table') return node;
  }
  return null;
}

function cellText(cell: TableCell): string {
  return nodeToString(cell).trim();
}

export function parseTable(node: Table): ParsedTable {
  const [headerRow, ...dataRows] = node.children;
  const headers = (headerRow?.children ?? []).map(cellText);
  const rows = dataRows.map(r => r.children.map(cellText));
  return { headers, rows, node };
}

export function findRow(table: ParsedTable, matcher: RowMatcher): number {
  const colIdx = table.headers.indexOf(matcher.column);
  if (colIdx === -1) return -1;
  for (let i = 0; i < table.rows.length; i++) {
    const cell = table.rows[i]?.[colIdx] ?? '';
    if (matcher.value instanceof RegExp) {
      if (matcher.value.test(cell)) return i;
    } else if (cell === matcher.value || cell.includes(matcher.value)) {
      return i;
    }
  }
  return -1;
}

function buildTextCell(value: string): TableCell {
  return {
    type: 'tableCell',
    children: [{ type: 'text', value }],
  };
}

export interface UpdateCellOpts {
  tableLocator: TableLocator;
  rowMatcher: RowMatcher;
  column: string;
  value: string;
}

export function updateCell(doc: Doc, opts: UpdateCellOpts): Doc {
  const node = findTable(doc, opts.tableLocator);
  if (!node) throw new Error(`table not found in ${opts.tableLocator.inSection ?? 'doc root'}`);
  const parsed = parseTable(node);
  const colIdx = parsed.headers.indexOf(opts.column);
  if (colIdx === -1) {
    throw new Error(
      `column "${opts.column}" not found in table header [${parsed.headers.join(', ')}]`,
    );
  }
  const rowIdx = findRow(parsed, opts.rowMatcher);
  if (rowIdx === -1) {
    throw new Error(
      `row with ${opts.rowMatcher.column}="${String(opts.rowMatcher.value)}" not found`,
    );
  }
  // node.children: index 0 is header, data rows start at index 1
  const dataRow = node.children[rowIdx + 1] as TableRow;
  dataRow.children[colIdx] = buildTextCell(opts.value);
  return doc;
}
