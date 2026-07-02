import { useState } from 'react'
import { Printer, RotateCcw, Send, CheckCircle } from 'lucide-react'
import Modal from '../crm/Modal'
import { generateCertificateText } from '../../data/certificateTemplates'
import { CERTIFICATE_TYPES } from '../../data/hrData'

// Prints via a hidden iframe (avoids popup blockers). unicode-bidi: plaintext lets each
// line pick its own direction, so Arabic and bilingual letters lay out correctly.
function printLetter(text) {
  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '100%'
  document.body.appendChild(iframe)
  const doc = iframe.contentDocument
  doc.open()
  doc.write(`<!doctype html><html><head><title>ALSUWEIDI — Certificate</title><style>
    body { font-family: Georgia, 'Times New Roman', serif; color: #111; margin: 48px 64px; }
    .head { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid #c81516; padding-bottom: 14px; margin-bottom: 36px; }
    .logo { font-size: 24px; font-weight: bold; color: #c81516; letter-spacing: 2px; }
    .logo small { display: block; font-size: 11px; color: #555; letter-spacing: 0.5px; font-weight: normal; }
    .addr { font-size: 11px; color: #555; text-align: right; line-height: 1.5; }
    pre { white-space: pre-wrap; font-family: inherit; font-size: 14px; line-height: 1.8; unicode-bidi: plaintext; }
  </style></head><body>
    <div class="head">
      <div class="logo">ALSUWEIDI<small>Engineering Consultants</small></div>
      <div class="addr">Abu Dhabi, United Arab Emirates<br/>hr@alsuweidi.com &nbsp;•&nbsp; +971-2-123-4570</div>
    </div>
    <pre>${text.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</pre>
  </body></html>`)
  doc.close()
  iframe.contentWindow.focus()
  iframe.contentWindow.print()
  setTimeout(() => document.body.removeChild(iframe), 2000)
}

export default function CertificateLetterModal({ request, employee, onClose, onSave }) {
  const [text, setText] = useState(request.letterText || generateCertificateText(request, employee))
  const [zohoStep, setZohoStep] = useState(false)

  const typeLabel = CERTIFICATE_TYPES.find((t) => t.value === request.type)?.label || 'Certificate'
  const isRtl = request.language === 'Arabic'

  return (
    <Modal title={`${typeLabel} — ${request.employeeName}`} onClose={onClose} wide>
      <div className="space-y-4">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Suggested wording, generated from the employee record — edit anything before issuing.</span>
          <button
            onClick={() => setText(generateCertificateText(request, employee))}
            className="flex items-center gap-1 text-brand font-medium hover:underline shrink-0 ml-4"
          >
            <RotateCcw size={12} /> Reset to template
          </button>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          dir={isRtl ? 'rtl' : 'ltr'}
          rows={18}
          className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-1 focus:ring-brand font-[Georgia,serif]"
          style={{ unicodeBidi: 'plaintext' }}
        />

        {zohoStep && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm space-y-2">
            <div className="font-semibold text-blue-900">Zoho Sign — workflow preview</div>
            <div className="text-blue-800 space-y-1 text-xs">
              <div>1. ✓ Letter uploaded to Zoho Sign as a PDF</div>
              <div>2. ✓ Signature request sent to the General Manager</div>
              <div>3. ⏳ Awaiting signature — status returns automatically via webhook</div>
            </div>
            <div className="text-xs text-blue-700 pt-1 border-t border-blue-200">
              This is a preview of the flow. The live integration needs the Phase 2 backend (Zoho API credentials can't be stored safely in a frontend-only app).
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t border-gray-200">
          <button
            onClick={() => printLetter(text)}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 flex items-center justify-center gap-1.5"
          >
            <Printer size={15} /> Print / PDF
          </button>
          <button
            onClick={() => setZohoStep(true)}
            className="flex-1 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 flex items-center justify-center gap-1.5"
          >
            <Send size={15} /> Send to Zoho Sign
          </button>
          <button
            onClick={() => { onSave(request.id, text); onClose() }}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-brand rounded-md hover:bg-brand-dark flex items-center justify-center gap-1.5"
          >
            <CheckCircle size={15} /> {request.status === 'issued' ? 'Save Letter' : 'Save & Mark Issued'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
