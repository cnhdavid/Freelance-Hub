export const getStatusBadge = (status: string) => {
  const statusConfig = {
    planning: {
      label: 'Planning',
      className: 'inline-flex px-3 py-1 text-xs font-medium rounded-full border bg-amber-500/10 text-amber-400 border-amber-500/20'
    },
    in_progress: {
      label: 'In Progress',
      className: 'inline-flex px-3 py-1 text-xs font-medium rounded-full border bg-blue-500/10 text-blue-400 border-blue-500/20'
    },
    completed: {
      label: 'Completed',
      className: 'inline-flex px-3 py-1 text-xs font-medium rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
    on_hold: {
      label: 'On Hold',
      className: 'inline-flex px-3 py-1 text-xs font-medium rounded-full border bg-gray-500/10 text-gray-400 border-gray-500/20'
    },
    cancelled: {
      label: 'Cancelled',
      className: 'inline-flex px-3 py-1 text-xs font-medium rounded-full border bg-red-500/10 text-red-400 border-red-500/20'
    }
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.planning
  
  return {
    ...config,
    element: <span className={config.className}>{config.label}</span>
  }
}

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'planning':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    case 'in_progress':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    case 'completed':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    case 'on_hold':
      return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    case 'cancelled':
      return 'bg-red-500/10 text-red-400 border-red-500/20'
    default:
      return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
  }
}
