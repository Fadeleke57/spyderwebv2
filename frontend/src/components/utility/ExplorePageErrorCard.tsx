import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

function ExplorePageErrorCard() {
  return (
    <Card className="w-full relative mx-auto min-h-[20px] bg-red-500/80 py-6">
      <CardHeader>
        <CardTitle className="text-sm">Error loading webs. Please try again.</CardTitle>
      </CardHeader>
    </Card>
  );
}

export default ExplorePageErrorCard;
