'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import * as d3 from 'd3';
import { LocateFixed, ZoomIn, ZoomOut } from 'lucide-react';
import { useStore } from '@/store';
import { GRAPH_NODE_COLORS } from '@/lib/utils';
import { useUserContext } from '@/lib/useUserContext';
import type { GraphNode, Subject } from '@/types';

interface GraphDatum extends GraphNode {
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  vx?: number;
  vy?: number;
}

interface LinkDatum {
  source: GraphDatum | string;
  target: GraphDatum | string;
  strength?: number;
  kind?: 'subject-note' | 'subject-tag' | 'note-tag' | 'note-note';
}

interface KnowledgeGraphProps {
  onNodeClick?: (nodeId: string, label: string, type: string) => void;
  showAllNotes?: boolean;   // toggle "toutes les notes" vs épinglées/favorites seulement
}

function shortLabel(text: string, max = 14): string {
  return text.length > max ? text.slice(0, max - 1) + '…' : text;
}

export function KnowledgeGraph({ onNodeClick, showAllNotes = true }: KnowledgeGraphProps) {
  const svgRef       = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const filterRef    = useRef<string | null>(null);
  const onNodeClickRef = useRef(onNodeClick);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const { notes, setGraphFilter, graphFilterNodeId } = useStore();
  const { subjectConfig } = useUserContext();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredNode, setHoveredNode] = useState<{
    id: string; label: string; type: string;
    noteCount?: number; wordCount?: number; x: number; y: number;
  } | null>(null);

  useEffect(() => { filterRef.current = graphFilterNodeId; }, [graphFilterNodeId]);
  useEffect(() => { onNodeClickRef.current = onNodeClick; }, [onNodeClick]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(([entry]) => {
      const width = Math.round(entry.contentRect.width);
      const height = Math.round(entry.contentRect.height);
      setDimensions((current) =>
        current.width === width && current.height === height
          ? current
          : { width, height }
      );
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const buildGraphData = useCallback(() => {
    const nodes: GraphDatum[] = [];
    const links: LinkDatum[]  = [];
    const nodeMap = new Map<string, GraphDatum>();
    const notesToShow = showAllNotes
      ? notes
      : notes.filter((n) => n.isPinned || n.isFavorite);

    // ── Nœuds matières ────────────────────────────────────────────────────────
    const subjectsInNotes = new Set(notesToShow.map((n) => n.subject));
    subjectsInNotes.forEach((subject) => {
      const config = subjectConfig[subject] ?? {
        emoji: '📚',
        color: GRAPH_NODE_COLORS.subject,
      };
      const notesForSubject = notesToShow.filter((n) => n.subject === subject);

      // Indicateur de maîtrise basé sur l'humeur
      const moodedNotes = notesForSubject.filter((n) => n.mood);
      const confusedCount = notesForSubject.filter((n) => n.mood === 'confused').length;
      const confusedRatio = moodedNotes.length > 0 ? confusedCount / moodedNotes.length : 0;
      // Couleur du nœud : vert (maîtrisé) → orange (fragile) → rouge (lacune)
      let nodeColor = config.color;
      if (moodedNotes.length >= 2) {
        if (confusedRatio > 0.6)      nodeColor = '#EF4444'; // rouge
        else if (confusedRatio > 0.3) nodeColor = '#F59E0B'; // orange
        else if (confusedRatio < 0.15) nodeColor = '#22C55E'; // vert
      }

      const node: GraphDatum = {
        id:      subject,
        label:   `${config.emoji} ${shortLabel(subject, 16)}`,
        type:    'subject',
        subject: subject as Subject,
        color:   nodeColor,
        size:    Math.min(32, 18 + notesForSubject.length * 1.5),
        noteIds: notesForSubject.map((n) => n.id),
      };
      nodes.push(node);
      nodeMap.set(subject, node);
    });

    // ── Nœuds concepts (tags) ─────────────────────────────────────────────────
    const tagCounts = new Map<string, number>();
    notesToShow.forEach((note) => {
      note.tags.forEach((tag) => {
        tagCounts.set(tag.label, (tagCounts.get(tag.label) ?? 0) + 1);
      });
    });
    tagCounts.forEach((count, tagLabel) => {
      const node: GraphDatum = {
        id:    `tag:${tagLabel}`,
        label: `#${shortLabel(tagLabel, 12)}`,
        type:  'concept',
        color: GRAPH_NODE_COLORS.concept,
        size:  Math.min(8 + count * 2, 18),
      };
      nodes.push(node);
      nodeMap.set(`tag:${tagLabel}`, node);
    });

    // ── Nœuds notes ───────────────────────────────────────────────────────────
    notesToShow.forEach((note) => {
      const subjectCfg = subjectConfig[note.subject];
      // Taille selon nb de mots (6..16)
      const size = Math.min(16, Math.max(6, 6 + Math.sqrt(note.wordCount) * 0.6));
      const node: GraphDatum = {
        id:    note.id,
        label: shortLabel(note.title, 20),
        type:  'note',
        // couleur légèrement désaturée de la matière
        color: subjectCfg?.color ?? GRAPH_NODE_COLORS.note,
        size,
      };
      nodes.push(node);
      nodeMap.set(note.id, node);
    });

    // ── Liens matière → tag ───────────────────────────────────────────────────
    notesToShow.forEach((note) => {
      if (!nodeMap.has(note.subject)) return;
      note.tags.forEach((tag) => {
        const tagId = `tag:${tag.label}`;
        if (!nodeMap.has(tagId)) return;
        const exists = links.some(
          (l) =>
            (l.source === note.subject && l.target === tagId) ||
            (l.target === note.subject && l.source === tagId)
        );
        if (!exists) links.push({ source: note.subject, target: tagId, strength: 0.25, kind: 'subject-tag' });
      });
    });

    // ── Liens matière → note ──────────────────────────────────────────────────
    notesToShow.forEach((note) => {
      if (!nodeMap.has(note.subject) || !nodeMap.has(note.id)) return;
      links.push({ source: note.subject, target: note.id, strength: 0.5, kind: 'subject-note' });
    });

    // ── Liens note → tag ──────────────────────────────────────────────────────
    notesToShow.forEach((note) => {
      if (!nodeMap.has(note.id)) return;
      note.tags.forEach((tag) => {
        const tagId = `tag:${tag.label}`;
        if (!nodeMap.has(tagId)) return;
        links.push({ source: note.id, target: tagId, strength: 0.2, kind: 'note-tag' });
      });
    });

    // ── Liens note ↔ note (tags communs) ─────────────────────────────────────
    // Pour chaque paire de notes, si elles partagent ≥1 tag → lien faible
    const noteIds = notesToShow.map((n) => n.id);
    const noteTagSets = new Map<string, Set<string>>(
      notesToShow.map((n) => [n.id, new Set(n.tags.map((t) => t.label))])
    );
    for (let i = 0; i < noteIds.length; i++) {
      for (let j = i + 1; j < noteIds.length; j++) {
        const a = noteIds[i], b = noteIds[j];
        const tagsA = noteTagSets.get(a)!;
        const tagsB = noteTagSets.get(b)!;
        // compte les tags en commun
        let shared = 0;
        for (const t of tagsA) if (tagsB.has(t)) shared++;
        if (shared > 0 && nodeMap.has(a) && nodeMap.has(b)) {
          links.push({
            source: a, target: b,
            strength: Math.min(0.05 * shared, 0.3),
            kind: 'note-note',
          });
        }
      }
    }

    return { nodes, links };
  }, [notes, showAllNotes, subjectConfig]);

  // ── Simulation D3 ─────────────────────────────────────────────────────────
  useEffect(() => {
    const svgElement = svgRef.current;
    const container = containerRef.current;
    if (!svgElement || !container || !dimensions.width || !dimensions.height) return;

    const { width, height } = dimensions;

    const svg = d3.select(svgElement);
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    const graphStyle = getComputedStyle(container);
    const graphLabelColor = graphStyle.getPropertyValue('--graph-label').trim() || '#303632';
    const graphLabelHalo = graphStyle.getPropertyValue('--graph-background').trim() || '#141A17';
    const graphConceptColor = graphStyle.getPropertyValue('--graph-concept').trim() || '#67C594';
    const graphSubjectHalo = graphStyle.getPropertyValue('--graph-subject-halo').trim() || '#27352D';
    const graphLinks = {
      subjectTag: graphStyle.getPropertyValue('--graph-link-subject').trim() || '#C47C16',
      noteTag: graphStyle.getPropertyValue('--graph-link-note').trim() || '#A66B2B',
      noteNote: graphStyle.getPropertyValue('--graph-link-shared').trim() || '#8A6541',
      subjectNote: graphStyle.getPropertyValue('--graph-link-subject-note').trim() || '#929B96',
    };

    const { nodes, links } = buildGraphData();
    if (nodes.length === 0) return;

    const g = svg.append('g');

    // Zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 5])
      .on('zoom', (event) => g.attr('transform', event.transform));
    zoomRef.current = zoom;
    svg.call(zoom);

    // Simulation — charge répulsive plus forte pour les grands graphes
    const repulse = Math.max(-320, -120 - nodes.length * 3);
    const simulation = d3.forceSimulation<GraphDatum>(nodes)
      .force('link', d3.forceLink<GraphDatum, LinkDatum>(links)
        .id((d) => d.id)
        .distance((l) => {
          if (l.kind === 'subject-note') return 90;
          if (l.kind === 'note-note')    return 60;
          if (l.kind === 'note-tag')     return 70;
          return 110; // subject-tag
        })
        .strength((l) => l.strength ?? 0.3))
      .force('charge', d3.forceManyBody<GraphDatum>().strength(repulse))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<GraphDatum>().radius((d) => (d.size ?? 10) + 14));

    // ── Liens ──────────────────────────────────────────────────────────────
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', (d) => {
        if (d.kind === 'subject-tag') return graphLinks.subjectTag;
        if (d.kind === 'note-tag') return graphLinks.noteTag;
        if (d.kind === 'note-note') return graphLinks.noteNote;
        return graphLinks.subjectNote;
      })
      .attr('stroke-width', (d) => d.kind === 'note-note' ? 2 : 1.8)
      .attr('stroke-dasharray', (d) => d.kind === 'note-note' ? '3,3' : null)
      .attr('stroke-linecap', 'round')
      .attr('opacity', 0.9);

    // ── Nœuds ──────────────────────────────────────────────────────────────
    const nodeGroup = g.append('g')
      .selectAll<SVGGElement, GraphDatum>('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(
        d3.drag<SVGGElement, GraphDatum>()
          .on('start', (event, d) => { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
          .on('drag',  (event, d) => { d.fx = event.x; d.fy = event.y; })
          .on('end',   (event, d) => { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; })
      );

    // Halo blanc derrière les nœuds matière
    nodeGroup.filter((d) => d.type === 'subject')
      .append('circle')
      .attr('r', (d) => (d.size ?? 22) + 4)
      .attr('fill', graphSubjectHalo)
      .attr('fill-opacity', 0.6);

    // Cercle principal — d.color contient déjà la couleur de maîtrise pour les matières
    const circles = nodeGroup.append('circle')
      .attr('r', (d) => d.size ?? 10)
      .attr('fill', (d) => {
        if (d.type === 'concept') return graphConceptColor;
        return d.color ?? '#9B9590';
      })
      .attr('fill-opacity', (d) => d.type === 'note' ? 0.65 : 0.88)
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Labels (seulement matières + concepts, pas les notes sauf si peu nombreuses)
    const showNoteLabels = nodes.filter((n) => n.type === 'note').length <= 20;
    nodeGroup.append('text')
      .text((d) => {
        if (d.type === 'note' && !showNoteLabels) return '';
        return d.label;
      })
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => (d.size ?? 10) + 13)
      .attr('font-size', (d) => d.type === 'subject' ? '11px' : '9px')
      .attr('font-weight', (d) => d.type === 'subject' ? '600' : '400')
      .attr('fill', graphLabelColor)
      .attr('stroke', graphLabelHalo)
      .attr('stroke-width', 3)
      .attr('paint-order', 'stroke')
      .attr('pointer-events', 'none');

    // ── Filtre visuel (sans recréer la sim) ────────────────────────────────
    const updateFilterStyles = (activeId: string | null) => {
      circles
        .attr('stroke', (d) => activeId === d.id ? '#F4A236' : 'white')
        .attr('stroke-width', (d) => activeId === d.id ? 3.5 : 2)
        .attr('fill-opacity', (d) => {
          if (!activeId) return d.type === 'note' ? 0.82 : 0.95;
          return activeId === d.id ? 1 : 0.2;
        });
      link.attr('stroke-opacity', (d) => {
        if (!activeId) return d.kind === 'note-note' ? 0.8 : 1;
        const src = typeof d.source === 'string' ? d.source : (d.source as GraphDatum).id;
        const tgt = typeof d.target === 'string' ? d.target : (d.target as GraphDatum).id;
        return src === activeId || tgt === activeId ? 1 : 0.08;
      });
    };

    updateFilterStyles(filterRef.current);

    const handleFilterChange = (e: Event) => {
      updateFilterStyles(((e as CustomEvent).detail as { nodeId: string }).nodeId);
    };
    svgElement.addEventListener('binlinpad:filter', handleFilterChange);

    // ── Clic nœud ──────────────────────────────────────────────────────────
    nodeGroup['on']('click', (event, d) => {
      event.stopPropagation();
      const newFilter = filterRef.current === d.id ? null : d.id;
      filterRef.current = newFilter;
      setGraphFilter(newFilter);
      updateFilterStyles(newFilter);
      onNodeClickRef.current?.(d.id, d.label, d.type);
    });

    // ── Hover ──────────────────────────────────────────────────────────────
    nodeGroup
      ['on']('mouseenter', (event, d) => {
        const rect = container.getBoundingClientRect();
        // Compte les notes liées à ce nœud (matière ou tag)
        let noteCount: number | undefined;
        let wordCount: number | undefined;
        if (d.type === 'subject') {
          const subjectNotes = notes.filter((n) => n.subject === d.id);
          noteCount = subjectNotes.length;
          wordCount = subjectNotes.reduce((s, n) => s + n.wordCount, 0);
        } else if (d.type === 'concept') {
          const tagLabel = d.id.replace('tag:', '');
          noteCount = notes.filter((n) => n.tags.some((t) => t.label === tagLabel)).length;
        }
        setHoveredNode({
          id: d.id, label: d.label, type: d.type,
          noteCount, wordCount,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
        d3.select<SVGGElement, GraphDatum>(event.currentTarget)
          .select('circle:last-of-type')
          .attr('stroke', '#F4A236').attr('stroke-width', 3);
      })
      ['on']('mouseleave', (event, d) => {
        setHoveredNode(null);
        d3.select<SVGGElement, GraphDatum>(event.currentTarget)
          .select('circle:last-of-type')
          .attr('stroke', filterRef.current === d.id ? '#F4A236' : 'white')
          .attr('stroke-width', filterRef.current === d.id ? 3.5 : 2);
      });

    // Clic fond → vider le filtre
    svg['on']('click', () => {
      filterRef.current = null;
      setGraphFilter(null);
      updateFilterStyles(null);
    });

    // Tick
    simulation['on']('tick', () => {
      link
        .attr('x1', (d) => (d.source as GraphDatum).x ?? 0)
        .attr('y1', (d) => (d.source as GraphDatum).y ?? 0)
        .attr('x2', (d) => (d.target as GraphDatum).x ?? 0)
        .attr('y2', (d) => (d.target as GraphDatum).y ?? 0);
      nodeGroup.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    return () => {
      simulation.stop();
      zoomRef.current = null;
      // Nettoyage explicite des listeners D3 pour éviter les fuites mémoire
      nodeGroup['on']('click', null)['on']('mouseenter', null)['on']('mouseleave', null);
      svg['on']('click', null)['on']('.zoom', null);
      svgElement.removeEventListener('binlinpad:filter', handleFilterChange);
    };
  }, [notes, showAllNotes, buildGraphData, setGraphFilter, dimensions]);

  const zoomBy = (factor: number) => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(220)
      .call(zoomRef.current.scaleBy, factor);
  };

  const resetZoom = () => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(280)
      .call(zoomRef.current.transform, d3.zoomIdentity);
  };

  return (
    <div ref={containerRef} className="knowledge-graph-surface relative h-full w-full overflow-hidden">
      <svg ref={svgRef} className="relative z-0 h-full w-full" />

      <div
        role="group"
        aria-label="Commandes de la carte"
        className="absolute left-4 top-4 z-10 flex items-center gap-1 rounded-xl border border-white/10 bg-[#202622]/90 p-1.5 text-[#D7DED9] shadow-lg shadow-black/20 backdrop-blur-md"
      >
        <button
          type="button"
          onClick={() => zoomBy(1.25)}
          title="Zoom avant"
          aria-label="Zoom avant"
          className="flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        >
          <ZoomIn size={16} />
        </button>
        <button
          type="button"
          onClick={() => zoomBy(0.8)}
          title="Zoom arrière"
          aria-label="Zoom arrière"
          className="flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        >
          <ZoomOut size={16} />
        </button>
        <span className="mx-0.5 h-5 w-px bg-black/10 dark:bg-white/10" />
        <button
          type="button"
          onClick={resetZoom}
          title="Recentrer la carte"
          aria-label="Recentrer la carte"
          className="flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        >
          <LocateFixed size={16} />
        </button>
      </div>

      {/* Tooltip hover enrichi */}
      {hoveredNode && (
        <div
          className="pointer-events-none absolute z-10 bg-[#1A1A1A] text-white text-xs px-3 py-2 rounded-xl shadow-lg max-w-[180px]"
          style={{ left: hoveredNode.x + 14, top: hoveredNode.y - 10 }}
        >
          <p className="font-semibold leading-tight">{hoveredNode.label}</p>
          {hoveredNode.noteCount !== undefined && (
            <p className="text-[#C8C4BE] mt-0.5">
              {hoveredNode.noteCount} note{hoveredNode.noteCount > 1 ? 's' : ''}
              {hoveredNode.wordCount ? ` · ${hoveredNode.wordCount} mots` : ''}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
