import { useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store';
import { useOffline } from './OfflineProvider';
import { saveProject, ProjectRecord } from '../storage/projects';
import { recoveryManager } from './RecoveryManager';

const AUTOSAVE_INTERVAL = 15000;

export function useAutosave() {
  const store = useStore();
  const { isOnline } = useOffline();

  const save = useCallback(async () => {
    try {
      const snapshot = {
        company: store.company,
        letter: store.letter,
        proposal: store.proposal,
        style: store.style,
        pages: store.pages,
        documentTitle: store.documentTitle,
        docMode: store.docMode,
        category: store.category,
        selectedElementIds: store.selectedElementIds,
        canvasViewport: store.canvasViewport,
        activePageId: store.activePageId,
        activeSidebarTab: store.activeSidebarTab,
        sidebarWidth: store.sidebarWidth,
        themeMode: store.themeMode,
        showGrid: store.showGrid,
        snapToGrid: store.snapToGrid,
        gridSize: store.gridSize,
      };

      const projectId = store.documentTitle.toLowerCase().replace(/\s+/g, '-') || 'untitled';

      const project: ProjectRecord = {
        id: projectId,
        title: store.documentTitle,
        docMode: store.docMode,
        category: store.category,
        data: snapshot as unknown as Record<string, unknown>,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncedAt: isOnline ? Date.now() : undefined,
      };

      await saveProject(project);

      await recoveryManager.saveSnapshot(snapshot as unknown as Record<string, unknown>, {
        documentTitle: store.documentTitle,
        canvasViewport: store.canvasViewport,
        activePageId: store.activePageId,
        activeSidebarTab: store.activeSidebarTab,
      });
    } catch {
      // Autosave failures are non-critical
    }
  }, [store, isOnline]);

  useEffect(() => {
    const interval = setInterval(save, AUTOSAVE_INTERVAL);
    return () => clearInterval(interval);
  }, [save]);

  const saveImmediate = useCallback(async () => {
    await save();
  }, [save]);

  return { saveImmediate };
}
