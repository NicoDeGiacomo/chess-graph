import { describe, it, expect } from 'vitest';
import { groupByFolder } from './folders.ts';
import type { Folder, Repertoire } from '../types/index.ts';

function makeFolder(overrides: Partial<Folder> & { id: string; name: string }): Folder {
  return {
    sortOrder: 0,
    collapsed: false,
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

function makeRep(overrides: Partial<Repertoire> & { id: string; name: string }): Repertoire {
  return {
    side: 'white',
    rootNodeId: 'r',
    folderId: null,
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

describe('groupByFolder', () => {
  it('puts all repertoires in uncategorized when no folders exist', () => {
    const reps = [makeRep({ id: '1', name: 'A' }), makeRep({ id: '2', name: 'B' })];
    const groups = groupByFolder(reps, []);
    expect(groups).toHaveLength(1);
    expect(groups[0].folder).toBeNull();
    expect(groups[0].repertoires).toHaveLength(2);
  });

  it('groups repertoires into their folders', () => {
    const f1 = makeFolder({ id: 'f1', name: 'Openings', sortOrder: 1 });
    const f2 = makeFolder({ id: 'f2', name: 'Endgames', sortOrder: 2 });
    const reps = [
      makeRep({ id: 'r1', name: 'Italian', folderId: 'f1' }),
      makeRep({ id: 'r2', name: 'Sicilian', folderId: 'f2' }),
      makeRep({ id: 'r3', name: 'Misc', folderId: null }),
    ];
    const groups = groupByFolder(reps, [f1, f2]);
    expect(groups).toHaveLength(3);
    expect(groups[0].folder?.id).toBe('f1');
    expect(groups[0].repertoires).toHaveLength(1);
    expect(groups[1].folder?.id).toBe('f2');
    expect(groups[1].repertoires).toHaveLength(1);
    expect(groups[2].folder).toBeNull();
    expect(groups[2].repertoires).toHaveLength(1);
  });

  it('treats orphaned folderId as uncategorized', () => {
    const f1 = makeFolder({ id: 'f1', name: 'Openings', sortOrder: 1 });
    const reps = [
      makeRep({ id: 'r1', name: 'Italian', folderId: 'deleted-folder' }),
      makeRep({ id: 'r2', name: 'French', folderId: null }),
    ];
    const groups = groupByFolder(reps, [f1]);
    expect(groups).toHaveLength(2);
    // f1 is empty
    expect(groups[0].folder?.id).toBe('f1');
    expect(groups[0].repertoires).toHaveLength(0);
    // uncategorized has both
    expect(groups[1].folder).toBeNull();
    expect(groups[1].repertoires).toHaveLength(2);
  });

  it('uncategorized section is always last', () => {
    const f1 = makeFolder({ id: 'f1', name: 'B Folder', sortOrder: 2 });
    const f2 = makeFolder({ id: 'f2', name: 'A Folder', sortOrder: 1 });
    const reps = [makeRep({ id: 'r1', name: 'Test', folderId: null })];
    const groups = groupByFolder(reps, [f2, f1]);
    expect(groups[groups.length - 1].folder).toBeNull();
  });

  it('returns empty folder groups for folders with no repertoires', () => {
    const f1 = makeFolder({ id: 'f1', name: 'Empty', sortOrder: 1 });
    const groups = groupByFolder([], [f1]);
    expect(groups).toHaveLength(2);
    expect(groups[0].folder?.id).toBe('f1');
    expect(groups[0].repertoires).toHaveLength(0);
    expect(groups[1].folder).toBeNull();
    expect(groups[1].repertoires).toHaveLength(0);
  });
});
