import { useState } from 'react'
import { FileText, Download } from 'lucide-react'
import { usePortfolioPacks } from '../../data/portfolioPacksStore'

const fmt = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

// Portfolio PDFs prepared and uploaded by Marketing (Marketing → Portfolio →
// Portfolio packs), grouped by category for CRM to hand to clients. Downloads
// are mocked until Phase 2 file storage.
export default function PortfolioDownloads() {
  const packs = usePortfolioPacks()
  const [downloaded, setDownloaded] = useState(null)

  const categories = [...new Set(packs.map((p) => p.category))].sort()

  const download = (pack) => {
    setDownloaded(pack.id)
    setTimeout(() => setDownloaded((d) => (d === pack.id ? null : d)), 2000)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <FileText size={15} className="text-brand" /> Portfolio downloads
        </h2>
        <p className="text-xs text-gray-500">
          Category portfolio PDFs prepared by Marketing — send the right one to the right client. Files are placeholders until Phase 2 storage.
        </p>
      </div>

      {packs.length === 0 ? (
        <div className="p-8 text-center text-sm text-gray-400">Marketing hasn't uploaded any portfolio packs yet.</div>
      ) : (
        <div className="p-4 space-y-4">
          {categories.map((category) => (
            <div key={category}>
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{category}</div>
              <div className="space-y-1.5">
                {packs.filter((p) => p.category === category).map((pack) => (
                  <div key={pack.id} className="border border-gray-200 rounded-lg px-3 py-2 flex items-center gap-3 hover:border-brand/40 transition">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-700 font-mono truncate">{pack.fileName}</div>
                      <div className="text-[11px] text-gray-400">uploaded {fmt(pack.uploadedDate)}</div>
                    </div>
                    <button
                      onClick={() => download(pack)}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border transition shrink-0 ${downloaded === pack.id ? 'text-green-700 border-green-200 bg-green-50' : 'text-brand border-brand/30 hover:bg-brand/5'}`}
                    >
                      <Download size={12} /> {downloaded === pack.id ? 'Demo only' : 'Download'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
