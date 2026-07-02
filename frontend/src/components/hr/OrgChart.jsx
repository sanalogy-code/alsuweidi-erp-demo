import { Users } from 'lucide-react'

function OrgNode({ employee, employees, onViewEmployee }) {
  const reports = employees.filter((e) => e.managerId === employee.id)

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={() => onViewEmployee?.(employee)}
        className="bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-2 text-left hover:border-brand hover:shadow-md transition min-w-[180px]"
      >
        <div className="font-medium text-sm text-brand">{employee.name}</div>
        <div className="text-xs text-gray-500">{employee.title}</div>
        <div className="text-xs text-gray-400">{employee.dept}</div>
      </button>

      {reports.length > 0 && (
        <>
          <div className="w-px h-6 bg-gray-300" />
          <div className="flex gap-8">
            {reports.map((report, idx) => (
              <div key={report.id} className="flex flex-col items-center relative">
                {reports.length > 1 && (
                  <div
                    className="absolute top-0 h-px bg-gray-300"
                    style={{
                      left: idx === 0 ? '50%' : 0,
                      right: idx === reports.length - 1 ? '50%' : 0,
                    }}
                  />
                )}
                <div className="w-px h-6 bg-gray-300" />
                <OrgNode employee={report} employees={employees} onViewEmployee={onViewEmployee} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function OrgChart({ employees, onViewEmployee }) {
  const roots = employees.filter((e) => !e.managerId)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Users size={16} className="text-brand" />
        <h2 className="text-sm font-semibold text-gray-800">Org Chart</h2>
        <span className="text-xs text-gray-400">— click a name for full details</span>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-12 justify-center min-w-max px-4">
          {roots.map((root) => (
            <OrgNode key={root.id} employee={root} employees={employees} onViewEmployee={onViewEmployee} />
          ))}
        </div>
      </div>
    </div>
  )
}
