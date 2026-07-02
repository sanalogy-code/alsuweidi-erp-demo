// Suggested letter text per certificate type, auto-filled from the employee record.
// HR can edit freely before issuing — these are starting points, not locked wording.
// Fields missing from the record render as [bracketed placeholders] to fill by hand.

const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

function fields(request, employee) {
  const comp = employee?.compensation
  const total = comp ? comp.basicSalary + comp.housingAllowance + comp.transportAllowance : null
  return {
    name: employee?.name || request.employeeName || '[employee name]',
    title: employee?.title || '[job title]',
    dept: employee?.dept || '[department]',
    nationality: employee?.nationality || '[nationality]',
    passportNo: employee?.passport?.number || '[passport number]',
    startDate: employee?.startDate ? fmtDate(employee.startDate) : '[start date]',
    total: total ? total.toLocaleString() : '[amount]',
    basic: comp ? comp.basicSalary.toLocaleString() : '[amount]',
    housing: comp ? comp.housingAllowance.toLocaleString() : '[amount]',
    transport: comp ? comp.transportAllowance.toLocaleString() : '[amount]',
    addressedTo: request.addressedTo || 'To Whom It May Concern',
    purpose: request.purpose || '',
    nocObject: request.nocObject || '[purpose of NOC]',
    today: fmtDate(new Date()),
    ref: `HR/${new Date().getFullYear()}/${String(request.id ?? 0).padStart(3, '0')}`,
  }
}

const EN_LIABILITY = 'This certificate is issued at the request of the employee, without any liability on the company towards any third party.'
const EN_SIGNOFF = 'Yours faithfully,\nFor ALSUWEIDI Engineering Consultants\n\n_______________________\nLayla Al Mazrouei\nHR Manager'
const AR_LIABILITY = 'وقد أُصدرت هذه الشهادة بناءً على طلب الموظف دون أدنى مسؤولية على الشركة تجاه أي طرف ثالث.'
const AR_SIGNOFF = 'وتفضلوا بقبول فائق الاحترام،\nعن شركة السويدي للاستشارات الهندسية\n\n_______________________\nليلى المزروعي\nمديرة الموارد البشرية'

const EN_BODY = {
  salary: (f) =>
    `This is to certify that ${f.name}, ${f.nationality} national, holder of passport No. ${f.passportNo}, has been employed with ALSUWEIDI Engineering Consultants since ${f.startDate}, currently holding the position of ${f.title} in the ${f.dept} department.\n\nThe employee's current total monthly remuneration is AED ${f.total}, comprising a basic salary of AED ${f.basic}, housing allowance of AED ${f.housing}, and transport allowance of AED ${f.transport}.`,
  employment: (f) =>
    `This is to certify that ${f.name}, ${f.nationality} national, holder of passport No. ${f.passportNo}, is a full-time employee of ALSUWEIDI Engineering Consultants since ${f.startDate}, currently holding the position of ${f.title} in the ${f.dept} department, and remains employed under a valid employment contract.`,
  salary_transfer: (f) =>
    `This is to confirm that ${f.name}, holder of passport No. ${f.passportNo}, is employed with ALSUWEIDI Engineering Consultants as ${f.title} since ${f.startDate}.\n\nWe confirm that the employee's total monthly salary of AED ${f.total} is, and will continue to be, transferred to their account with ${f.addressedTo} through the UAE Wage Protection System (WPS) for as long as they remain in our employment. We undertake to notify you in the event of the employee's end of service.`,
  noc: (f) =>
    `This is to confirm that ${f.name}, ${f.nationality} national, holder of passport No. ${f.passportNo}, is employed with ALSUWEIDI Engineering Consultants as ${f.title} since ${f.startDate}.\n\nWe hereby confirm that we have NO OBJECTION to the above-named employee proceeding with: ${f.nocObject}.`,
  embassy: (f) =>
    `This is to certify that ${f.name}, ${f.nationality} national, holder of passport No. ${f.passportNo}, is employed with ALSUWEIDI Engineering Consultants as ${f.title} since ${f.startDate}, with a total monthly salary of AED ${f.total}.\n\n${f.purpose ? `The employee intends to travel for: ${f.purpose}. ` : ''}The employee's leave has been approved and they will resume their duties with us upon return. We kindly request that they be extended every assistance with their visa application. The company confirms that the employee's travel expenses are borne by the employee personally.`,
  experience: (f) =>
    `This is to certify that ${f.name}, ${f.nationality} national, has been employed with ALSUWEIDI Engineering Consultants from ${f.startDate} to date, currently holding the position of ${f.title} in the ${f.dept} department, with a last drawn total monthly salary of AED ${f.total}.\n\nDuring their tenure, the employee has carried out their duties with diligence and professionalism. We issue this certificate in appreciation of their service and wish them continued success.`,
}

const EN_SUBJECT = {
  salary: 'Salary Certificate',
  employment: 'Employment Certificate',
  salary_transfer: 'Salary Transfer Letter',
  noc: 'No Objection Certificate (NOC)',
  embassy: 'Employment & Salary Confirmation — Visa Application',
  experience: 'Experience / Service Certificate',
}

const AR_SUBJECT = {
  salary: 'شهادة راتب',
  employment: 'شهادة عمل',
  salary_transfer: 'خطاب تحويل راتب',
  noc: 'شهادة عدم ممانعة',
  embassy: 'خطاب إلى السفارة — تأكيد عمل وراتب',
  experience: 'شهادة خبرة',
}

const AR_BODY = {
  salary: (f) =>
    `تشهد شركة السويدي للاستشارات الهندسية بأن ${f.name}، ${f.nationality} الجنسية، يحمل جواز سفر رقم ${f.passportNo}، يعمل لدى الشركة منذ ${f.startDate} ويشغل حالياً وظيفة ${f.title} في قسم ${f.dept}.\n\nويتقاضى الموظف راتباً شهرياً إجمالياً قدره ${f.total} درهم إماراتي، يشمل راتباً أساسياً قدره ${f.basic} درهم، وبدل سكن قدره ${f.housing} درهم، وبدل مواصلات قدره ${f.transport} درهم.`,
  employment: (f) =>
    `تشهد شركة السويدي للاستشارات الهندسية بأن ${f.name}، ${f.nationality} الجنسية، يحمل جواز سفر رقم ${f.passportNo}، يعمل لدى الشركة بدوام كامل منذ ${f.startDate} ويشغل حالياً وظيفة ${f.title} في قسم ${f.dept}، ولا يزال على رأس عمله بموجب عقد عمل ساري المفعول.`,
  salary_transfer: (f) =>
    `نؤكد بأن ${f.name}، حامل جواز السفر رقم ${f.passportNo}، يعمل لدى شركة السويدي للاستشارات الهندسية بوظيفة ${f.title} منذ ${f.startDate}.\n\nكما نؤكد بأن راتبه الشهري الإجمالي البالغ ${f.total} درهم إماراتي يُحوَّل وسيستمر تحويله إلى حسابه لديكم عبر نظام حماية الأجور (WPS) طوال فترة عمله لدينا، ونتعهد بإخطاركم في حال انتهاء خدمته.`,
  noc: (f) =>
    `نؤكد بأن ${f.name}، ${f.nationality} الجنسية، حامل جواز السفر رقم ${f.passportNo}، يعمل لدى شركة السويدي للاستشارات الهندسية بوظيفة ${f.title} منذ ${f.startDate}.\n\nونفيدكم بأنه لا مانع لدينا من قيام الموظف المذكور أعلاه بـ: ${f.nocObject}.`,
  embassy: (f) =>
    `تشهد شركة السويدي للاستشارات الهندسية بأن ${f.name}، ${f.nationality} الجنسية، حامل جواز السفر رقم ${f.passportNo}، يعمل لدى الشركة بوظيفة ${f.title} منذ ${f.startDate}، براتب شهري إجمالي قدره ${f.total} درهم إماراتي.\n\nوقد تمت الموافقة على إجازة الموظف وسيستأنف عمله لدينا فور عودته، ونرجو التكرم بتقديم كل مساعدة ممكنة له في طلب التأشيرة، علماً بأن نفقات سفره على حسابه الشخصي.`,
  experience: (f) =>
    `تشهد شركة السويدي للاستشارات الهندسية بأن ${f.name}، ${f.nationality} الجنسية، يعمل لدى الشركة منذ ${f.startDate} حتى تاريخه، ويشغل حالياً وظيفة ${f.title} في قسم ${f.dept}، وكان آخر راتب شهري إجمالي تقاضاه ${f.total} درهم إماراتي.\n\nوقد قام الموظف خلال فترة عمله بأداء مهامه بكل جدٍّ واحترافية، ونتمنى له دوام التوفيق والنجاح.`,
}

function englishLetter(request, f) {
  return `Date: ${f.today}\nRef: ${f.ref}\n\nTo: ${f.addressedTo}\n\nSubject: ${EN_SUBJECT[request.type] || 'Certificate'}\n\nTo Whom It May Concern,\n\n${EN_BODY[request.type]?.(f) || ''}\n\n${EN_LIABILITY}\n\n${EN_SIGNOFF}`
}

function arabicLetter(request, f) {
  return `التاريخ: ${f.today}\nالمرجع: ${f.ref}\n\nإلى: ${f.addressedTo}\n\nالموضوع: ${AR_SUBJECT[request.type] || 'شهادة'}\n\nإلى من يهمه الأمر،\n\n${AR_BODY[request.type]?.(f) || ''}\n\n${AR_LIABILITY}\n\n${AR_SIGNOFF}`
}

export function generateCertificateText(request, employee) {
  const f = fields(request, employee)
  if (request.language === 'Arabic') return arabicLetter(request, f)
  if (request.language === 'Bilingual (English & Arabic)') {
    return `${englishLetter(request, f)}\n\n\n${'—'.repeat(30)}\n\n\n${arabicLetter(request, f)}`
  }
  return englishLetter(request, f)
}
