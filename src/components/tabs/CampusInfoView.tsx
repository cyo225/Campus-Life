import React, { useState } from 'react';
import {
  ExternalLink,
  PhoneCall,
  GraduationCap,
  BookOpen,
  Library,
  Bus,
  Globe,
  MapPin,
  Calendar,
  AlertCircle,
  Bell,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
} from 'lucide-react';
import { CampusLink, CampusAnnouncement } from '../../types';

interface CampusInfoViewProps {
  links: CampusLink[];
  announcements: CampusAnnouncement[];
}

export const CampusInfoView: React.FC<CampusInfoViewProps> = ({ links, announcements }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedNoticeId, setExpandedNoticeId] = useState<string | null>(announcements[0]?.id || null);

  const renderIcon = (name: string) => {
    switch (name) {
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5" />;
      case 'Library':
        return <Library className="w-5 h-5" />;
      case 'Bus':
        return <Bus className="w-5 h-5" />;
      case 'Globe':
        return <Globe className="w-5 h-5" />;
      case 'MapPin':
        return <MapPin className="w-5 h-5" />;
      case 'Calendar':
        return <Calendar className="w-5 h-5" />;
      case 'PhoneCall':
        return <PhoneCall className="w-5 h-5" />;
      default:
        return <ExternalLink className="w-5 h-5" />;
    }
  };

  const filteredAnnouncements = announcements.filter((a) =>
    activeCategory === 'all' ? true : a.category === activeCategory
  );

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      {/* 24-hr Emergency Banner */}
      <div className="p-3.5 rounded-3xl bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-md shadow-rose-900/10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xs font-bold leading-tight">朝陽校安中心 24 小時急難通報</h3>
            <p className="text-[11px] text-rose-100 font-mono mt-0.5">(04) 2332-0600 · 警衛室</p>
          </div>
        </div>
        <a
          href="tel:0423320600"
          className="px-3 py-1.5 rounded-xl bg-white text-rose-700 font-bold text-xs hover:bg-rose-50 transition-colors shadow-2xs shrink-0"
        >
          立即撥打
        </a>
      </div>

      {/* Campus Public Web Portals Section */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-4.5 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">重要公開網站連結</h2>
            <p className="text-xs text-slate-400">快速前往朝陽官方常用系統與校園便民服務</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {renderIcon(link.iconName)}
                  </div>
                  {link.badge && (
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.5 rounded-md">
                      {link.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors flex items-center gap-1">
                  <span>{link.title}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 opacity-60 shrink-0" />
                </h3>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                {link.description}
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* Announcements & Events Section */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-4.5 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">校園公告與活動</h2>
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
            {['all', '教務處', '學務處', '總務處', '活動專區'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2 py-1 rounded-lg font-bold transition-colors whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {cat === 'all' ? '全部' : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          {filteredAnnouncements.map((item) => {
            const isExpanded = expandedNoticeId === item.id;
            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all ${
                  item.isImportant
                    ? 'border-amber-200/80 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20'
                    : 'border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
                }`}
              >
                <button
                  onClick={() => setExpandedNoticeId(isExpanded ? null : item.id)}
                  className="w-full p-3.5 text-left flex items-start justify-between gap-2"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      <span className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700">
                        {item.category}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{item.date}</span>
                      {item.isImportant && (
                        <span className="text-amber-600 dark:text-amber-400 font-bold">
                          [重要公告]
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                      {item.title}
                    </h3>
                  </div>

                  <div className="p-1 text-slate-400 hover:text-slate-600 shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-200/50 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed animate-in fade-in duration-150">
                    <p>{item.content}</p>
                    <div className="mt-2 text-right">
                      <a
                        href="https://www.cyut.edu.tw/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline"
                      >
                        <span>檢視校網官方原文</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
