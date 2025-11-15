"use client";

import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import useOpportunitiesTree from "@/hooks/useOpportunitiesTree";
import { VerseTreeView } from "@/components/verse-tree-view";
import PageBackground from '@/components/PageBackground';
import LandingNavbar from '@/components/LandingNavbar';

export default function ChainPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const parentId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const { treesByParent, isLoading } = useOpportunitiesTree();
  const tree = parentId ? treesByParent.get(parentId) : undefined;

  if (isLoading) {
    return (
      <div className="relative min-h-screen">
        <PageBackground />
        <LandingNavbar />
        <div className="relative z-10 p-6 pt-20">Loading tree…</div>
      </div>
    );
  }

  if (!tree) {
    return (
      <div className="relative min-h-screen">
        <PageBackground />
        <LandingNavbar />
        <div className="relative z-10 p-6 pt-20 space-y-4">
          <div>Tree not found</div>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>
      </div>
    );
  }

  // Reuse the visualization component by passing the root id as verseId
  return (
    <div className="relative min-h-screen">
      <PageBackground />
      <LandingNavbar />
      <div className="relative z-10 px-6 py-8 pt-20">
        <VerseTreeView tree={tree} verseId={tree.parentId} onBack={() => router.push("/dashboard")} />
      </div>
    </div>
  );
}
