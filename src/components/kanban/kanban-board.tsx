import { CONTENT_STATUS_ORDER, type ContentIdea } from '@/types/novum'
import { KanbanColumn } from './kanban-column'

type DeliveryInfo = { status: string; delivery_date: string; editor_id: string | null }

type Props = {
  ideas: ContentIdea[]
  deliveryMap?: Record<string, DeliveryInfo>
  profileMap?: Record<string, string>
}

export function KanbanBoard({ ideas, deliveryMap = {}, profileMap = {} }: Props) {
  const byStatus = CONTENT_STATUS_ORDER.map((status) => ({
    status,
    ideas: ideas
      .filter((idea) => idea.status === status)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
  }))

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scroll-pl-4 -mx-4 px-4 md:mx-0 md:px-0 md:snap-none">
      {byStatus.map(({ status, ideas }) => (
        <KanbanColumn
          key={status}
          status={status}
          ideas={ideas}
          deliveryMap={deliveryMap}
          profileMap={profileMap}
        />
      ))}
    </div>
  )
}
