"use client";

import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import useOpportunitiesTree from "@/hooks/useOpportunitiesTree";
import { VerseTreeView } from "@/components/verse-tree-view";

export default function ChainPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const parentId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const { treesByParent, isLoading } = useOpportunitiesTree();
  const tree = parentId ? treesByParent.get(parentId) : undefined;

  if (isLoading) {
    return <div className="p-6">Loading tree…</div>;
  }

  if (!tree) {
    return (
      <div className="p-6 space-y-4">
        <div>Tree not found</div>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
    );
  }

  // Reuse the visualization component by passing the root id as verseId
  return (
    <div className="px-6 py-8">
      <VerseTreeView tree={tree} verseId={tree.parentId} onBack={() => router.push("/dashboard")} />
    </div>
  );
}
