import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import matter from 'gray-matter';
import { loadCorpus, getStories, type Corpus } from '../../lib/index.ts';

const DOCS_DIR = process.env.KONI_DOCS_DIR ?? path.resolve(process.cwd(), 'docs');

export function getDocsDir(): string {
  return DOCS_DIR;
}

export interface DocNode {
  absolutePath: string;
  relativePath: string;
  slug: string;
  title: string;
  category: string;
}

export interface TreeNode {
  name: string;
  type: 'folder' | 'file';
  path: string;
  href?: string;
  title?: string;
  children?: TreeNode[];
}

const TOP_LEVEL_ORDER = ['README', 'BRIEF', 'PRD', 'ARCHITECTURE', 'CONTEXT', 'DOMAIN-ENTITIES', 'SETUP', 'DEPLOY', 'CHANGELOG', 'LESSONS'];
const FOLDER_ORDER = ['sprints', 'decisions', 'superpowers', 'dev', 'reference', 'references'];

export async function scanDocFiles(dir: string = DOCS_DIR, baseDir: string = DOCS_DIR): Promise<DocNode[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: DocNode[] = [];
  for (const entry of entries) {
    const resPath = path.resolve(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.') || entry.name === 'audit') continue;
      files.push(...(await scanDocFiles(resPath, baseDir)));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const relativePath = path.relative(baseDir, resPath);
      const slug = relativePath.slice(0, -3);
      const parts = relativePath.split(path.sep);
      let category = 'Core Docs';
      if (parts.length > 1) {
        const part0 = parts[0];
        if (part0 === 'sprints') {
          if (parts[1] === 'stories') category = 'User Stories';
          else if (parts[1] === 'epics') category = 'Epics';
          else category = 'Sprints';
        } else if (part0) {
          category = part0.charAt(0).toUpperCase() + part0.slice(1);
        }
      }
      const fileContent = await fs.readFile(resPath, 'utf-8');
      const { data, content } = matter(fileContent);
      let title = String(data.title ?? '');
      if (!title) {
        const titleMatch = content.match(/^#\s+(.+)$/m);
        title = titleMatch?.[1] ?? entry.name.slice(0, -3);
      }
      files.push({ absolutePath: resPath, relativePath, slug, title, category });
    }
  }
  return files.sort((a, b) => a.title.localeCompare(b.title));
}

export function buildFileTree(files: DocNode[]): TreeNode[] {
  const root: TreeNode = { name: 'root', type: 'folder', path: '', children: [] };
  for (const file of files) {
    const parts = file.relativePath.split(path.sep);
    let cursor = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]!;
      const isLast = i === parts.length - 1;
      const currentPath = parts.slice(0, i + 1).join('/');
      if (isLast) {
        cursor.children!.push({
          name: part.replace(/\.md$/, ''),
          type: 'file',
          path: currentPath,
          href: `/docs/${file.slug}`,
          title: file.title,
        });
      } else {
        let folder = cursor.children!.find(c => c.type === 'folder' && c.name === part);
        if (!folder) {
          folder = { name: part, type: 'folder', path: currentPath, children: [] };
          cursor.children!.push(folder);
        }
        cursor = folder;
      }
    }
  }
  const sortNode = (node: TreeNode): void => {
    if (!node.children) return;
    node.children.sort((a, b) => {
      if (node.path === '' && a.type !== b.type) return a.type === 'file' ? -1 : 1;
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      if (node.path === '') {
        if (a.type === 'file' && b.type === 'file') {
          const ai = TOP_LEVEL_ORDER.indexOf(a.name);
          const bi = TOP_LEVEL_ORDER.indexOf(b.name);
          if (ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
        }
        if (a.type === 'folder' && b.type === 'folder') {
          const ai = FOLDER_ORDER.indexOf(a.name);
          const bi = FOLDER_ORDER.indexOf(b.name);
          if (ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
        }
      }
      return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
    });
    node.children.forEach(sortNode);
  };
  sortNode(root);
  return root.children ?? [];
}

export interface DashboardData {
  corpus: Corpus;
  stories: Array<{
    id: string;
    title: string;
    epic: string;
    status: string;
    priority: string;
    points: number;
    sprint: string;
    assignee: string;
    version_shipped: string;
    slug: string;
  }>;
  epics: Array<{
    epic: string;
    total: number;
    done: number;
    inProgress: number;
    inReview: number;
    blocked: number;
    backlog: number;
    totalPoints: number;
    donePoints: number;
    shippedVersions: string[];
  }>;
}

export function loadDashboardData(): DashboardData {
  const corpus = loadCorpus(DOCS_DIR);
  const allStories = getStories(corpus).map(s => {
    const fm = s.frontmatter;
    return {
      id: String(fm.id ?? ''),
      title: String(fm.title ?? s.filename.replace(/\.md$/, '')),
      epic: String(fm.epic ?? '—'),
      status: String(fm.status ?? 'backlog'),
      priority: String(fm.priority ?? '—'),
      points: typeof fm.points === 'number' ? fm.points : 0,
      sprint: String(fm.sprint ?? '—'),
      assignee: String(fm.assignee ?? '—'),
      version_shipped: String(fm.version_shipped ?? ''),
      slug: `sprints/stories/${s.filename.replace(/\.md$/, '')}`,
    };
  }).sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' }));

  const buckets = new Map<string, typeof allStories>();
  for (const s of allStories) {
    const arr = buckets.get(s.epic) ?? [];
    arr.push(s);
    buckets.set(s.epic, arr);
  }
  const epics = [...buckets.entries()].map(([epic, list]) => {
    const counts = { done: 0, inProgress: 0, inReview: 0, blocked: 0, backlog: 0 };
    let totalPoints = 0, donePoints = 0;
    const versions = new Set<string>();
    for (const s of list) {
      totalPoints += s.points;
      switch (s.status) {
        case 'done': counts.done++; donePoints += s.points; break;
        case 'in-progress': counts.inProgress++; break;
        case 'in-review':
        case 'review': counts.inReview++; break;
        case 'blocked': counts.blocked++; break;
        default: counts.backlog++;
      }
      if (s.version_shipped) versions.add(s.version_shipped);
    }
    return { epic, total: list.length, ...counts, totalPoints, donePoints, shippedVersions: [...versions].sort() };
  }).sort((a, b) => a.epic.localeCompare(b.epic, undefined, { numeric: true }));

  return { corpus, stories: allStories, epics: epics.filter(e => e.epic && e.epic !== '—') };
}
