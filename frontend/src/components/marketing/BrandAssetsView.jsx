import { useState } from 'react'
import { Palette, Download, FileImage, FileText, LayoutTemplate, Stamp, Camera, Type, BookOpen, FolderOpen } from 'lucide-react'
import { BRAND_ASSETS, BRAND_ASSET_CATEGORIES, BRAND_QUICK_GUIDELINES } from '../../data/marketingData'

const CATEGORY_ICON = {
  Logos: FileImage,
  Fonts: Type,
  Templates: LayoutTemplate,
  Guidelines: FileText,
  Stationery: Stamp,
  Photography: Camera,
}

const fmt = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

// Branding library — the one Marketing view visible to EVERYONE. The default
// view is the quick guidelines (which logo/font/colour, when); the full asset
// library sits behind the second tab. Downloads are mocked until Phase 2 storage.
export default function BrandAssetsView() {
  const [tab, setTab] = useState('guidelines') // 'guidelines' | 'library'
  const [category, setCategory] = useState('')
  const [downloaded, setDownloaded] = useState(null)

  const assets = BRAND_ASSETS.filter((a) => !category || a.category === category)
  const g = BRAND_QUICK_GUIDELINES

  const download = (asset) => {
    setDownloaded(asset.id)
    setTimeout(() => setDownloaded((d) => (d === asset.id ? null : d)), 2000)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <Palette size={15} className="text-brand" /> Branding
        </h2>
        <p className="text-xs text-gray-500 mb-3">
          Approved logos, fonts, templates, and guidelines — always use these, never a re-saved copy. Files are placeholders until Phase 2 storage.
        </p>
        <div className="flex gap-2 border-b border-gray-100 -mb-4">
          {[{ key: 'guidelines', label: 'Quick guidelines', icon: BookOpen }, { key: 'library', label: 'Asset library', icon: FolderOpen }].map((t) => {
            const Icon = t.icon
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition flex items-center gap-1.5 ${tab === t.key ? 'text-brand border-brand' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
              >
                <Icon size={13} /> {t.label}
              </button>
            )
          })}
        </div>
      </div>

      {tab === 'guidelines' && (
        <div className="p-4 space-y-5">
          <p className="text-xs text-gray-500">
            The 30-second version of the Brand Guidelines. When in doubt, check the full
            <span className="font-medium text-gray-700"> Brand Guidelines</span> and
            <span className="font-medium text-gray-700"> Platform + Narrative Guide</span> in the asset library.
          </p>

          <div>
            <div className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-2 flex items-center gap-1.5"><FileImage size={12} /> Which logo, when</div>
            <div className="space-y-1.5">
              {g.logos.map((row) => (
                <div key={row.variant} className="flex gap-3 text-xs bg-gray-50 rounded-md px-3 py-2">
                  <span className="w-36 shrink-0 font-semibold text-gray-700">{row.variant}</span>
                  <span className="text-gray-600">{row.when}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-2 flex items-center gap-1.5"><Type size={12} /> Which font, when</div>
            <div className="space-y-1.5">
              {g.fonts.map((row) => (
                <div key={row.name} className="flex gap-3 text-xs bg-gray-50 rounded-md px-3 py-2">
                  <span className="w-36 shrink-0 font-semibold text-gray-700">{row.name}</span>
                  <span className="text-gray-600">{row.when}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-2 flex items-center gap-1.5"><Palette size={12} /> Colours</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {g.colors.map((c) => (
                <div key={c.name} className="flex gap-3 items-start text-xs bg-gray-50 rounded-md px-3 py-2">
                  <span className="w-8 h-8 rounded-md border border-gray-200 shrink-0" style={{ backgroundColor: c.hex }} />
                  <span>
                    <span className="font-semibold text-gray-700">{c.name}</span>
                    <span className="text-gray-400 font-mono ml-1.5">{c.hex}</span>
                    <div className="text-gray-600 mt-0.5">{c.when}</div>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'library' && (
        <>
          <div className="p-4 pb-0 flex gap-1.5 flex-wrap">
            <button
              onClick={() => setCategory('')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${!category ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              All
            </button>
            {BRAND_ASSET_CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${category === c ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {assets.map((asset) => {
              const Icon = CATEGORY_ICON[asset.category] || FileText
              return (
                <div key={asset.id} className="border border-gray-200 rounded-lg p-4 hover:border-brand/40 hover:shadow-sm transition">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-md bg-brand/10 text-brand flex items-center justify-center shrink-0">
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-800">{asset.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{asset.description}</div>
                        <div className="text-[11px] text-gray-400 mt-1.5">
                          {asset.format} • {asset.sizeLabel} • updated {fmt(asset.updatedDate)}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => download(asset)}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border transition shrink-0 ${downloaded === asset.id ? 'text-green-700 border-green-200 bg-green-50' : 'text-brand border-brand/30 hover:bg-brand/5'}`}
                    >
                      <Download size={12} /> {downloaded === asset.id ? 'Demo only' : 'Download'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
