import React, { useState } from 'react';
import { LOOKBOOK_ITEMS, LOOKBOOK_TAGS } from '../../data/lookbook';
import { Eye, Heart, Share2, Sparkles, X } from 'lucide-react';

export default function LookbookSection() {
  const [selectedTag, setSelectedTag] = useState('all');
  const [activeModalItem, setActiveModalItem] = useState(null);

  const filteredItems = selectedTag === 'all'
    ? LOOKBOOK_ITEMS
    : LOOKBOOK_ITEMS.filter((item) => item.tag === selectedTag);

  return (
    <section className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="badge-gold">Tác Phẩm Nhiếp Ảnh</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-serif-title text-slate-900">
            Album Lookbook Kỷ Yếu & Nghệ Thuật
          </h2>
          <p className="text-slate-600 text-sm">
            Bộ sưu tập các bộ ảnh tiêu biểu được thực hiện bởi đội ngũ nhiếp ảnh gia và stylist Aura Studio.
          </p>
        </div>

        {/* Tag Filters Bar (Inspired by Cong Studio Topic Tags) */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {LOOKBOOK_TAGS.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setSelectedTag(tag.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                selectedTag === tag.id
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>

        {/* Gallery Grid (Clean Grid Layout with Lightbox Modal) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveModalItem(item)}
              className="card-clean rounded-3xl overflow-hidden cursor-pointer group flex flex-col justify-between"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 badge-gold shadow-sm">
                  {item.category}
                </span>

                <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                  <div className="p-3 rounded-full bg-white text-slate-900 shadow-lg">
                    <Eye className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-2">
                <h3 className="font-bold text-base text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 font-medium">
                  <span>Ekip: Aura Studio</span>
                  <span>{item.likesCount} Yêu thích</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Detail Modal */}
        {activeModalItem && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white max-w-4xl w-full rounded-3xl overflow-hidden shadow-2xl relative border border-slate-200 grid grid-cols-1 md:grid-cols-12 max-h-[90vh]">
              <button
                onClick={() => setActiveModalItem(null)}
                className="absolute top-4 right-4 z-10 p-2.5 text-slate-600 hover:text-slate-900 rounded-full bg-white/80 backdrop-blur-md shadow-md"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="md:col-span-8 bg-slate-950 flex items-center justify-center overflow-hidden">
                <img
                  src={activeModalItem.image}
                  alt={activeModalItem.title}
                  className="max-h-[80vh] w-full object-contain"
                />
              </div>

              <div className="md:col-span-4 p-6 flex flex-col justify-between space-y-6 bg-white overflow-y-auto">
                <div className="space-y-4">
                  <span className="badge-gold">{activeModalItem.category}</span>
                  <h3 className="text-2xl font-bold font-serif-title text-slate-900">{activeModalItem.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{activeModalItem.description}</p>

                  <div className="space-y-2 pt-4 border-t border-slate-100 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Chủ đề:</span>
                      <strong className="text-slate-900">{activeModalItem.conceptName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Địa điểm thực hiện:</span>
                      <strong className="text-slate-900">{activeModalItem.location || 'Studio 101 Hoàng Cầu'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Ekip Nhiếp Ảnh:</span>
                      <strong className="text-slate-900">Aura Pro Team</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5 text-rose-600">
                    <Heart className="w-4 h-4 fill-rose-600" />
                    <span>{activeModalItem.likesCount} Lượt thích</span>
                  </span>
                  <button className="flex items-center gap-1 text-slate-500 hover:text-amber-600">
                    <Share2 className="w-4 h-4" />
                    <span>Chia sẻ</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
