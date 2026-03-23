"use client";

import {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
  type MouseEvent as ReactMouseEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import {
  Home,
  LayoutGrid,
  ShoppingBag,
  FileText,
  Settings,
  ZoomIn,
  ZoomOut,
  Maximize,
  Globe,
  Clock,
  Eye,
  Pencil,
  MoreHorizontal,
  Sparkles,
} from "lucide-react";
import clsx from "clsx";
import type { PageItem } from "./PageCard";
import { PAGE_TYPE_LABELS } from "./PageCard";

// ── Node layout constants ──
const NODE_W = 220;
const NODE_H = 100;
const GAP_X = 60;
const GAP_Y = 50;
const LEVEL_HEIGHT = NODE_H + GAP_Y;

// ── Column config (same as SiteMapView) ──
interface ColumnDef {
  id: string;
  title: string;
  icon: typeof Home;
  color: string;
  hexColor: string;
  pageTypes: string[];
}

const COLUMNS: ColumnDef[] = [
  { id: "top", title: "トップ", icon: Home, color: "bg-violet-500", hexColor: "#8b5cf6", pageTypes: ["landing"] },
  { id: "collections", title: "コレクション", icon: LayoutGrid, color: "bg-blue-500", hexColor: "#3b82f6", pageTypes: ["collection", "list-collections"] },
  { id: "products", title: "商品", icon: ShoppingBag, color: "bg-emerald-500", hexColor: "#10b981", pageTypes: ["product"] },
  { id: "content", title: "コンテンツ", icon: FileText, color: "bg-amber-500", hexColor: "#f59e0b", pageTypes: ["about", "contact", "blog", "article"] },
  { id: "utility", title: "ユーティリティ", icon: Settings, color: "bg-gray-400", hexColor: "#9ca3af", pageTypes: ["cart", "search", "account", "password", "404", "general"] },
];

// ── Canvas Node type ──
interface CanvasNode {
  id: string;
  page: PageItem;
  x: number;
  y: number;
  column: ColumnDef;
}

interface SiteMapCanvasProps {
  pages: PageItem[];
  storeConnected: boolean;
  onPreview: (pageId: string) => void;
  onEdit?: (conversationId: string) => void;
  onDeploy: (pageId: string) => void;
  onDelete: (page: PageItem) => void;
  deploying: string | null;
  deleting: string | null;
}

function getColumnForPage(pageType: string): ColumnDef {
  return COLUMNS.find((c) => c.pageTypes.includes(pageType)) || COLUMNS[4];
}

function layoutNodes(pages: PageItem[]): CanvasNode[] {
  // Group pages by column
  const groups: Record<string, PageItem[]> = {};
  for (const col of COLUMNS) groups[col.id] = [];
  for (const page of pages) {
    const col = getColumnForPage(page.pageType || "general");
    groups[col.id].push(page);
  }

  const nodes: CanvasNode[] = [];
  let colX = 40;

  for (const col of COLUMNS) {
    const colPages = groups[col.id];
    // Column header position
    const headerY = 20;

    for (let i = 0; i < colPages.length; i++) {
      nodes.push({
        id: colPages[i].id,
        page: colPages[i],
        x: colX,
        y: headerY + 40 + i * LEVEL_HEIGHT,
        column: col,
      });
    }

    if (colPages.length > 0 || true) {
      colX += NODE_W + GAP_X;
    }
  }

  return nodes;
}

export default function SiteMapCanvas({
  pages,
  storeConnected,
  onPreview,
  onEdit,
  onDeploy,
  onDelete,
  deploying,
  deleting,
}: SiteMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const nodes = useMemo(() => layoutNodes(pages), [pages]);

  // Canvas dimensions — must account for all column headers (even empty columns)
  const canvasWidth = useMemo(() => {
    const nodeMax = nodes.length === 0 ? 0 : Math.max(...nodes.map((n) => n.x + NODE_W));
    // All column headers are always rendered, so ensure the last header has room
    const colHeaderMax = 40 + (COLUMNS.length - 1) * (NODE_W + GAP_X) + NODE_W;
    return Math.max(nodeMax, colHeaderMax) + 80;
  }, [nodes]);
  const canvasHeight = useMemo(() => {
    if (nodes.length === 0) return 600;
    return Math.max(...nodes.map((n) => n.y + NODE_H)) + 80;
  }, [nodes]);

  // ── Pan handlers ──
  const handleMouseDown = useCallback(
    (e: ReactMouseEvent) => {
      if (e.button !== 0) return;
      // Don't pan when clicking on a node
      if ((e.target as HTMLElement).closest("[data-canvas-node]")) return;
      setIsPanning(true);
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        panX: pan.x,
        panY: pan.y,
      };
    },
    [pan],
  );

  const handleMouseMove = useCallback(
    (e: ReactMouseEvent) => {
      if (!isPanning) return;
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setPan({
        x: panStartRef.current.panX + dx,
        y: panStartRef.current.panY + dy,
      });
    },
    [isPanning],
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // ── Zoom handlers ──
  const handleWheel = useCallback((e: ReactWheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    setZoom((z) => Math.min(Math.max(z + delta, 0.3), 2.0));
  }, []);

  const zoomIn = useCallback(() => setZoom((z) => Math.min(z + 0.15, 2.0)), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(z - 0.15, 0.3)), []);
  const zoomFit = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Edges: connect homepage to second-level pages
  const edges = useMemo(() => {
    const homepage = nodes.find(
      (n) => n.page.pageType === "landing" || n.page.slug === "/",
    );
    if (!homepage) return [];

    // Connect homepage to first page of each other column
    const targets: CanvasNode[] = [];
    for (const col of COLUMNS) {
      if (col.id === "top") continue;
      const firstInCol = nodes.find((n) => n.column.id === col.id);
      if (firstInCol) targets.push(firstInCol);
    }

    return targets.map((target) => ({
      from: homepage,
      to: target,
    }));
  }, [nodes]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Zoom controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-xl border border-border shadow-sm px-1 py-1">
        <button
          onClick={zoomOut}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/[0.04] transition-colors"
          title="ズームアウト"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-[11px] text-muted-foreground min-w-[40px] text-center font-mono">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={zoomIn}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/[0.04] transition-colors"
          title="ズームイン"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-border mx-0.5" />
        <button
          onClick={zoomFit}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/[0.04] transition-colors"
          title="フィット"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>

      {/* Canvas area */}
      <div
        ref={containerRef}
        className={clsx(
          "flex-1 overflow-hidden relative",
          isPanning ? "cursor-grabbing" : "cursor-grab",
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
            width: canvasWidth,
            height: canvasHeight,
            position: "relative",
          }}
        >
          {/* SVG edges layer */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={canvasWidth}
            height={canvasHeight}
          >
            {edges.map((edge, i) => {
              const x1 = edge.from.x + NODE_W / 2;
              const y1 = edge.from.y + NODE_H;
              const x2 = edge.to.x + NODE_W / 2;
              const y2 = edge.to.y;
              const midY = (y1 + y2) / 2;
              return (
                <path
                  key={i}
                  d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
                  fill="none"
                  stroke={edge.to.column.hexColor}
                  strokeWidth={2}
                  strokeOpacity={0.25}
                  strokeDasharray="4 4"
                />
              );
            })}
          </svg>

          {/* Column headers */}
          {COLUMNS.map((col, ci) => {
            const x = 40 + ci * (NODE_W + GAP_X);
            return (
              <div
                key={col.id}
                className="absolute flex items-center gap-2"
                style={{ left: x, top: 20 }}
              >
                <div
                  className={clsx(
                    "w-5 h-5 rounded-md flex items-center justify-center",
                    col.color,
                  )}
                >
                  <col.icon className="w-3 h-3 text-white" />
                </div>
                <span className="text-[12px] font-semibold text-foreground/60 whitespace-nowrap">
                  {col.title}
                </span>
              </div>
            );
          })}

          {/* Page nodes */}
          {nodes.map((node) => (
            <CanvasPageNode
              key={node.id}
              node={node}
              isSelected={selectedNode === node.id}
              onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
              onPreview={() => onPreview(node.page.id)}
              onEdit={
                node.page.conversationId && onEdit
                  ? () => onEdit!(node.page.conversationId!)
                  : undefined
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Canvas Page Node ──

function CanvasPageNode({
  node,
  isSelected,
  onClick,
  onPreview,
  onEdit,
}: {
  node: CanvasNode;
  isSelected: boolean;
  onClick: () => void;
  onPreview: () => void;
  onEdit?: () => void;
}) {
  const { page, x, y, column } = node;

  const isPublished =
    page.status === "published" ||
    (page.status === "synced" && page.shopifyPublished);

  return (
    <div
      data-canvas-node
      className={clsx(
        "absolute rounded-xl border-2 bg-white shadow-sm overflow-hidden transition-all duration-150 select-none",
        isSelected
          ? "border-accent shadow-md shadow-accent/10 ring-2 ring-accent/10"
          : "border-border/50 hover:border-border hover:shadow-md",
      )}
      style={{
        left: x,
        top: y,
        width: NODE_W,
        height: NODE_H,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {/* Color bar */}
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: column.hexColor }}
      />

      {/* Content */}
      <div className="px-3 py-2">
        <div className="flex items-start justify-between gap-1 mb-1">
          <h4 className="text-[12px] font-semibold text-foreground truncate leading-snug flex-1">
            {page.title}
          </h4>
          {page.source === "aicata" && (
            <Sparkles className="w-3 h-3 text-accent/50 shrink-0 mt-0.5" />
          )}
        </div>

        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-[10px] text-muted-foreground truncate">
            {page.slug ? `/${page.slug}` : page.pageType}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {isPublished ? (
              <span className="flex items-center gap-0.5 text-[9px] font-medium text-emerald-600">
                <Globe className="w-2.5 h-2.5" />
                公開中
              </span>
            ) : (
              <span className="flex items-center gap-0.5 text-[9px] font-medium text-gray-400">
                <Clock className="w-2.5 h-2.5" />
                下書き
              </span>
            )}
            <span className="text-[9px] text-muted-foreground bg-black/[0.04] px-1 py-0.5 rounded">
              {PAGE_TYPE_LABELS[page.pageType || "general"] || page.pageType}
            </span>
          </div>

          {/* Quick actions */}
          {isSelected && (
            <div className="flex items-center gap-0.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview();
                }}
                className="p-1 rounded-md text-muted-foreground hover:text-accent hover:bg-accent/5 transition-colors"
                title="プレビュー"
              >
                <Eye className="w-3 h-3" />
              </button>
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="p-1 rounded-md text-muted-foreground hover:text-accent hover:bg-accent/5 transition-colors"
                  title="編集"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
