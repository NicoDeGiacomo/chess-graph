import { useEffect } from 'react';
import type { RepertoireState } from './useRepertoire.tsx';

export function useArrowKeyNav(
  state: RepertoireState,
  selectNode: (nodeId: string) => void,
) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't navigate when typing in inputs or when dialogs are open
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (state.editingNodeId || state.linkingNodeId) return;

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
          if (node.childIds.length > 0) targetId = node.childIds[0];
          break;
        }
        case 'ArrowUp': {
          if (!node.parentId) break;
          const parent = nodesMap.get(node.parentId);
          if (!parent || parent.childIds.length <= 1) break;
          const idx = parent.childIds.indexOf(selectedNodeId);
          const prevIdx = idx <= 0 ? parent.childIds.length - 1 : idx - 1;
          targetId = parent.childIds[prevIdx];
          break;
        }
        case 'ArrowDown': {
          if (!node.parentId) break;
          const parent = nodesMap.get(node.parentId);
          if (!parent || parent.childIds.length <= 1) break;
          const idx = parent.childIds.indexOf(selectedNodeId);
          const nextIdx = idx >= parent.childIds.length - 1 ? 0 : idx + 1;
          targetId = parent.childIds[nextIdx];
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
  }, [state, selectNode]);
}
