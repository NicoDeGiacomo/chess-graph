import type { Folder, Repertoire } from '../types/index.ts';

export function groupByFolder(
  repertoires: Repertoire[],
  folders: Folder[],
): { folder: Folder | null; repertoires: Repertoire[] }[] {
  const folderIds = new Set(folders.map((f) => f.id));
  const groups: { folder: Folder | null; repertoires: Repertoire[] }[] = [];

  // Named folders in sortOrder
  for (const folder of folders) {
    const folderReps = repertoires.filter((r) => r.folderId === folder.id);
    groups.push({ folder, repertoires: folderReps });
  }

  // Uncategorized: null folderId + orphaned folderId references
  const uncategorized = repertoires.filter(
    (r) => r.folderId === null || !folderIds.has(r.folderId),
  );
  groups.push({ folder: null, repertoires: uncategorized });

  return groups;
}
