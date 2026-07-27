"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateDealStage } from "@/lib/deals/actions";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import type { Deal, PipelineStage } from "@/lib/types/database.types";

interface DealWithRelations extends Deal {
  contacts?: { id: string; first_name: string; last_name: string | null } | null;
  companies?: { id: string; name: string } | null;
}

export function KanbanBoard({
  deals,
  stages,
}: {
  deals: DealWithRelations[];
  stages: PipelineStage[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [draggedId, setDraggedId] = useState<string | null>(null);

  function moveDeal(dealId: string, stageId: string) {
    startTransition(async () => {
      await updateDealStage(dealId, stageId);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {stages.map((stage) => {
        const stageDeals = deals.filter((d) => d.stage_id === stage.id);
        const stageValue = stageDeals.reduce(
          (sum, d) => sum + Number(d.value ?? 0),
          0
        );

        return (
          <div
            key={stage.id}
            className="flex w-72 shrink-0 flex-col rounded-md bg-gray-100 p-3"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedId) moveDeal(draggedId, stage.id);
              setDraggedId(null);
            }}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">{stage.name}</h3>
              <span className="text-xs text-gray-500">
                {stageDeals.length} · ${stageValue.toLocaleString()}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {stageDeals.map((deal) => (
                <Card
                  key={deal.id}
                  draggable
                  onDragStart={() => setDraggedId(deal.id)}
                  className="cursor-grab bg-white active:cursor-grabbing"
                >
                  <p className="font-medium">{deal.name}</p>
                  <p className="text-sm text-gray-600">
                    ${Number(deal.value).toLocaleString()} {deal.currency}
                  </p>
                  {deal.contacts && (
                    <Link
                      href={`/contacts/${deal.contacts.id}`}
                      className="mt-1 block text-xs text-gray-500 underline"
                    >
                      {deal.contacts.first_name} {deal.contacts.last_name ?? ""}
                    </Link>
                  )}
                  {deal.companies && (
                    <Link
                      href={`/companies/${deal.companies.id}`}
                      className="block text-xs text-gray-500 underline"
                    >
                      {deal.companies.name}
                    </Link>
                  )}
                  <Select
                    className="mt-2 py-1 text-xs"
                    value={stage.id}
                    disabled={isPending}
                    onChange={(e) => moveDeal(deal.id, e.target.value)}
                  >
                    {stages.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </Select>
                </Card>
              ))}
              {stageDeals.length === 0 && (
                <p className="rounded-md border border-dashed border-gray-300 px-2 py-4 text-center text-xs text-gray-400">
                  No deals — drag one here
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
