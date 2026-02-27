import { useEffect, type RefObject } from 'react';
import type { RepertoireState } from './useRepertoire.tsx';

export function useArrowKeyNav(
  state: RepertoireState,
  selectNode: (nodeId: string) => void,
  collapsedNodes?: Set<string>,
  toggleCollapse?: (nodeId: string) => void,
  nodePositionsRef?: RefObject<Map<string, { x: number; y: number }>>,
) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't navigate when typing in inputs or when dialogs are open
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (state.editingNodeId) return;

      const { selectedNodeId, nodesMap } = state;
      if (!selectedNodeId) return;

      const node = nodesMap.get(selectedNodeId);
      if (!node) return;

      let targetId: string | undefined;

      switch (e.key) {
        case 'ArrowLeft': {
          if (node.parentId) targetId = node.parentId;
          break;
        }
        case 'ArrowRight': {
          // If node is collapsed, expand it instead of navigating
          if (collapsedNodes?.has(selectedNodeId) && toggleCollapse) {
            e.preventDefault();
            toggleCollapse(selectedNodeId);
            return;
          }
          const children = getSortedChildren(node, nodePositionsRef);
          if (children.length > 0) targetId = children[0];
          break;
        }
        case 'ArrowUp': {
          if (!node.parentId) break;
          const parent = nodesMap.get(node.parentId);
          if (!parent) break;
          const siblings = getSortedChildren(parent, nodePositionsRef);
          if (siblings.length <= 1) break;
          const idx = siblings.indexOf(selectedNodeId);
          const prevIdx = idx <= 0 ? siblings.length - 1 : idx - 1;
          targetId = siblings[prevIdx];
          break;
        }
        case 'ArrowDown': {
          if (!node.parentId) break;
          const parent = nodesMap.get(node.parentId);
          if (!parent) break;
          const siblings = getSortedChildren(parent, nodePositionsRef);
          if (siblings.length <= 1) break;
          const idx = siblings.indexOf(selectedNodeId);
          const nextIdx = idx >= siblings.length - 1 ? 0 : idx + 1;
          targetId = siblings[nextIdx];
          break;
        }
      }

      if (targetId) {
        e.preventDefault();
        selectNode(targetId);
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [state, selectNode, collapsedNodes, toggleCollapse, nodePositionsRef]);
}

/** Build a deduplicated, y-sorted list of child node IDs */
function getSortedChildren(
  parent: { childIds: string[]; transpositionEdges: { targetId: string }[] },
  nodePositionsRef?: RefObject<Map<string, { x: number; y: number }>>,
): string[] {
  const childSet = new Set([
    ...parent.childIds,
    ...parent.transpositionEdges.map((te) => te.targetId),
  ]);
  const children = [...childSet];
  const positions = nodePositionsRef?.current;
  if (positions) {
    children.sort((a, b) => (positions.get(a)?.y ?? 0) - (positions.get(b)?.y ?? 0));
  }
  return children;
}
