import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

function ExplorePageErrorCard() {
  return (
    <Card className="w-full relative mx-auto min-h-[40px] bg-red-500/20 py-6 border-b-2">
      <CardHeader>
        <CardTitle className="text-sm">Error loading webs. Please try again.</CardTitle>
      </CardHeader>
    </Card>
  );
}

export default ExplorePageErrorCard;
