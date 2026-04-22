import type { ContentIdea, ContentStatus } from '@/types/novum'
import { STAGE_META } from './stage-meta'
import { KanbanCard } from './kanban-card'
import { BabyIdeaForm } from './baby-idea-form'

type DeliveryInfo = { status: string; delivery_date: string; editor_id: string | null }

type Props = {
  status: ContentStatus
  ideas: ContentIdea[]
  deliveryMap?: Record<string, DeliveryInfo>
  profileMap?: Record<string, string>
}

export function KanbanColumn({ status, ideas, deliveryMap = {}, profileMap = {} }: Props) {
  const meta = STAGE_META[status]
  const isBabyIdea = status === 'baby_idea'

  return (
    <section className="flex h-full w-[80vw] max-w-[300px] min-w-[240px] flex-none md:flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card snap-start">
      <header className={`${meta.bg} px-4 py-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`inline-block h-2 w-2 rounded-full ${meta.dot}`} />
            <h3 className="t-label text-foreground">{meta.label}</h3>
          </div>
          <span className="text-xs font-medium text-muted-foreground">{ideas.length}</span>
        </div>
      </header>
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {ideas.map((idea) => (
          <KanbanCard
            key={idea.id}
            idea={idea}
            canDelete={isBabyIdea}
            delivery={deliveryMap[idea.id]}
            editorName={
              deliveryMap[idea.id]?.editor_id
                ? profileMap[deliveryMap[idea.id].editor_id!]
                : undefined
            }
          />
        ))}
        {isBabyIdea && <BabyIdeaForm />}
        {!isBabyIdea && ideas.length === 0 && (
          <p className="px-1 py-4 text-xs text-muted-foreground">Sin items.</p>
        )}
      </div>
    </section>
  )
}
