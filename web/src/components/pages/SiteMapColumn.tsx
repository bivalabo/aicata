"use client";

import type { LucideIcon } from "lucide-react";
import { Plus } from "lucide-react";
import clsx from "clsx";
import PageCard from "./PageCard";
import type { PageItem } from "./PageCard";

interface SiteMapColumnProps {
  title: string;
  icon: LucideIcon;
  color: string;
  /** このカラムの代表ページタイプ（作成ボタンで使用） */
  pageType?: string;
  pages: PageItem[];
  storeConnected: boolean;
  onPreview: (pageId: string) => void;
  onEdit?: (conversationId: string) => void;
  onEnhance?: (pageId: string) => void;
  onDeploy: (pageId: string) => void;
  onDelete: (page: PageItem) => void;
  /** ページタイプ付きの作成コールバック */
  onCreatePage?: (pageType?: string) => void;
  deploying: string | null;
  deleting: string | null;
}

export default function SiteMapColumn({
  title,
  icon: Icon,
  color,
  pageType,
  pages,
  storeConnected,
  onPreview,
  onEdit,
  onEnhance,
  onDeploy,
  onDelete,
  onCreatePage,
  deploying,
  deleting,
}: SiteMapColumnProps) {
  return (
    <div className="flex flex-col min-w-[240px] max-w-[300px] flex-1">
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-2 mb-2">
        <div className="flex items-center gap-2">
          <div
            className={clsx(
              "w-6 h-6 rounded-lg flex items-center justify-center",
              color,
            )}
          >
            <Icon className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-[13px] font-semibold text-foreground">
            {title}
          </span>
          <span className="text-[11px] text-muted-foreground/60 bg-black/[0.04] px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
            {pages.length}
          </span>
        </div>

        {onCreatePage && (
          <button
            onClick={() => onCreatePage(pageType)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold text-white bg-gradient-to-r from-[#7c5cfc] to-[#5b8def] hover:shadow-md hover:shadow-[#7c5cfc]/20 active:scale-[0.97] transition-all"
            title={`${title}ページを作成`}
          >
            <Plus className="w-3.5 h-3.5" />
            作成
          </button>
        )}
      </div>

      {/* Card list */}
      <div className="flex-1 overflow-y-auto space-y-2 px-1 pb-4">
        {pages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div
              className={clsx(
                "w-10 h-10 rounded-xl flex items-center justify-center mb-2 opacity-20",
                color,
              )}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-[11px] text-muted-foreground/40 mb-3">
              ページなし
            </p>
            {onCreatePage && (
              <button
                onClick={() => onCreatePage(pageType)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold text-white bg-gradient-to-r from-[#7c5cfc] to-[#5b8def] hover:shadow-lg hover:shadow-[#7c5cfc]/20 active:scale-[0.97] transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                {title}ページを作成
              </button>
            )}
          </div>
        ) : (
          pages.map((page) => (
            <PageCard
              key={page.id}
              page={page}
              storeConnected={storeConnected}
              onPreview={onPreview}
              onEdit={onEdit}
              onEnhance={onEnhance}
              onDeploy={onDeploy}
              onDelete={onDelete}
              deploying={deploying}
              deleting={deleting}
            />
          ))
        )}
      </div>
    </div>
  );
}
