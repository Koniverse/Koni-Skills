import type { List, ListItem, Paragraph, Strong, Text } from 'mdast';
import { toString as nodeToString } from 'mdast-util-to-string';
import { findSection } from './sections.ts';
import type { Doc } from '../types.ts';

export interface CheckboxItem {
  id: string | null;
  text: string;
  done: boolean;
}

const ID_REGEX = /^\s*\*?\*?(AC|TASK)-[\d.]+\*?\*?\s*[—-]\s*(.+)$/;

function extractIdAndText(itemText: string): { id: string | null; text: string } {
  const m = itemText.match(ID_REGEX);
  if (!m) return { id: null, text: itemText.trim() };
  const idMatch = itemText.match(/(AC|TASK)-[\d.]+/);
  return { id: idMatch?.[0] ?? null, text: (m[2] ?? '').trim() };
}

function findChecklistInSection(doc: Doc, heading: string): { list: List } | null {
  const sec = findSection(doc, heading);
  if (!sec) return null;
  for (const n of sec.body) {
    if (n?.type === 'list') {
      return { list: n as List };
    }
  }
  return null;
}

export function parseCheckboxes(doc: Doc, heading: string): CheckboxItem[] {
  const found = findChecklistInSection(doc, heading);
  if (!found) return [];
  return found.list.children.map((li: ListItem) => {
    const raw = nodeToString(li);
    const { id, text } = extractIdAndText(raw);
    return { id, text, done: li.checked === true };
  });
}

function buildItemNode(item: CheckboxItem): ListItem {
  const paragraphChildren: (Strong | Text)[] = [];

  if (item.id) {
    // Create strong node for the ID
    paragraphChildren.push({
      type: 'strong',
      children: [{ type: 'text', value: item.id } as Text],
    } as Strong);
    // Add the separator and text
    paragraphChildren.push({ type: 'text', value: ` — ${item.text}` } as Text);
  } else {
    paragraphChildren.push({ type: 'text', value: item.text } as Text);
  }

  return {
    type: 'listItem',
    checked: item.done,
    spread: false,
    children: [
      {
        type: 'paragraph',
        children: paragraphChildren,
      } as Paragraph,
    ],
  };
}

export function setCheckboxState(doc: Doc, opts: { heading: string; id: string; done: boolean }): Doc {
  const found = findChecklistInSection(doc, opts.heading);
  if (!found) return doc;
  for (const li of found.list.children) {
    const raw = nodeToString(li);
    if (raw.includes(opts.id)) {
      (li as ListItem).checked = opts.done;
    }
  }
  return doc;
}

export function appendCheckbox(doc: Doc, opts: { heading: string; id: string; text: string }): Doc {
  const found = findChecklistInSection(doc, opts.heading);
  if (!found) return doc;
  found.list.children.push(buildItemNode({ id: opts.id, text: opts.text, done: false }));
  return doc;
}

export function replaceCheckboxes(doc: Doc, heading: string, items: CheckboxItem[]): Doc {
  const found = findChecklistInSection(doc, heading);
  if (!found) return doc;
  found.list.children = items.map(buildItemNode);
  return doc;
}
