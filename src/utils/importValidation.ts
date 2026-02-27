const MAX_NODES = 500_000;
const VALID_SIDES = new Set(['white', 'black']);

export function validateImportData(data: unknown): string | null {
  if (data == null || typeof data !== 'object') {
    return 'Import data is not an object';
  }

  const d = data as Record<string, unknown>;

  // Top-level structure
  if (!Array.isArray(d.repertoires)) {
    return 'Missing or invalid "repertoires" array';
  }
  if (!Array.isArray(d.nodes)) {
    return 'Missing or invalid "nodes" array';
  }

  const repertoires = d.repertoires as Record<string, unknown>[];
  const nodes = d.nodes as Record<string, unknown>[];

  // Size guard
  if (nodes.length > MAX_NODES) {
    return `Import contains ${nodes.length} nodes, exceeding the limit of ${MAX_NODES}`;
  }

  // Validate repertoire shapes
  for (let i = 0; i < repertoires.length; i++) {
    const r = repertoires[i];
    if (typeof r.id !== 'string' || r.id === '') {
      return `Repertoire at index ${i} has missing or invalid "id"`;
    }
    if (typeof r.name !== 'string') {
      return `Repertoire "${r.id}" has missing or invalid "name"`;
    }
    if (!VALID_SIDES.has(r.side as string)) {
      return `Repertoire "${r.id}" has invalid "side" (must be "white" or "black")`;
    }
    if (typeof r.rootNodeId !== 'string' || r.rootNodeId === '') {
      return `Repertoire "${r.id}" has missing or invalid "rootNodeId"`;
    }
  }

  // Validate node shapes
  const nodeIds = new Set<string>();
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    if (typeof n.id !== 'string' || n.id === '') {
      return `Node at index ${i} has missing or invalid "id"`;
    }
    if (typeof n.repertoireId !== 'string' || n.repertoireId === '') {
      return `Node "${n.id}" has missing or invalid "repertoireId"`;
    }
    if (typeof n.fen !== 'string' || n.fen === '') {
      return `Node "${n.id}" has missing or invalid "fen"`;
    }
    if (n.parentId !== null && typeof n.parentId !== 'string') {
      return `Node "${n.id}" has invalid "parentId" (must be string or null)`;
    }
    if (!Array.isArray(n.childIds)) {
      return `Node "${n.id}" has missing or invalid "childIds"`;
    }
    nodeIds.add(n.id as string);
  }

  // Referential integrity: every repertoire's rootNodeId must exist in nodes
  for (const r of repertoires) {
    if (!nodeIds.has(r.rootNodeId as string)) {
      return `Repertoire "${r.id}" references rootNodeId "${r.rootNodeId}" which does not exist in nodes`;
    }
  }

  // Circular reference detection: walk child trees from each root
  const circularError = detectCircularReferences(nodes);
  if (circularError) {
    return circularError;
  }

  return null;
}

function detectCircularReferences(nodes: Record<string, unknown>[]): string | null {
  const childMap = new Map<string, string[]>();
  for (const n of nodes) {
    childMap.set(n.id as string, n.childIds as string[]);
  }

  // childIds form a strict tree — visiting any node twice means a cycle or invalid DAG
  const visited = new Set<string>();

  for (const n of nodes) {
    if (n.parentId !== null) continue;

    const stack = [n.id as string];
    while (stack.length > 0) {
      const current = stack.pop()!;
      if (visited.has(current)) {
        return `Circular reference detected involving node "${current}"`;
      }
      visited.add(current);

      const children = childMap.get(current);
      if (children) {
        for (const childId of children) {
          stack.push(childId);
        }
      }
    }
  }

  return null;
}
