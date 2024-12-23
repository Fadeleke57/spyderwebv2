import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { BucketConfigFormValues } from "@/types/article";
import { useState, Dispatch, SetStateAction } from "react";
import { LoadingPage } from "@/components/utility/Loading";
import BucketDataDrawer from "./BucketDataDrawer";
import { useDeleteSource, useFetchSourcesForBucket } from "@/hooks/sources";
import { Source, SourceAsNode } from "@/types/source";
import { Trash } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useFetchBucketById } from "@/hooks/buckets";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { formatText } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface GraphProps {
  setConfig: (value: BucketConfigFormValues) => void;
  bucketId: string;
  hasSources: boolean;
  fetchedSources: Source[];
  setFetchedSources: Dispatch<SetStateAction<Source[]>>;
  selectedSourceId: string | null;
  setSelectedSourceId: Dispatch<SetStateAction<string>>;
}

function BucketGraph({
  bucketId,
  hasSources,
  fetchedSources,
  setFetchedSources,
  selectedSourceId,
  setSelectedSourceId,
}: GraphProps) {
  const trashRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useIsMobile();
  const { user } = useUser();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const {
    data: bucket,
    isLoading: bucketLoading,
    refetch: refetchBucket,
  } = useFetchBucketById(bucketId);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const {
    data: sources,
    isLoading,
    error: sourcesError,
    refetch: refetchSources,
  } = useFetchSourcesForBucket(bucketId);
  const { mutateAsync: deleteSource } = useDeleteSource();

  const handleDeleteSource = async (sourceId: string) => {
    await deleteSource(sourceId);
    refetchBucket();
    refetchSources();
  };

  useEffect(() => {
    setFetchedSources(sources);
    const width = 3200;
    const height = 2400;
    const centerX = width / 8 + (isMobile ? -220 : 40);
    const centerY = height / 8 - 70;
    const circleRadius = Math.min(width, height) / 2 - 50;

    const zoomToNode = (event: MouseEvent | null, d: SourceAsNode) => {
      if (event) event.stopPropagation();

      const scale = 3;
      const [x, y] = [
        isMobile ? d.x + centerX + 10 : d.x + centerX - 20,
        d.y + centerY + 40,
      ];

      const transform = d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(scale)
        .translate(-x, -y);

      svg
        .transition()
        .duration(750)
        .call(zoom.transform as any, transform);

      setSelectedSource(d);
      setSelectedSourceId(d.sourceId);
      setDrawerOpen(true);
    };

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);
    svg.selectAll("*").remove();

    const g = svg.append("g");

    svg.append("style").text(`
      circle {
        transition: opacity 0.3s ease, fill 0.3s ease;
      }
      text {
        transition: opacity 0.3s ease, transform 0.3s ease;
      }
    `);

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom as any);

    const nodes: SourceAsNode[] =
      sources &&
      sources.map((d: Source, i: number) => {
        const angle = (i / sources.length) * 2 * Math.PI;
        const x = centerX + circleRadius * Math.cos(angle);
        const y = centerY + circleRadius * Math.sin(angle);
        return { ...d, x, y };
      });
    const fileSizes = nodes && nodes.map((d) => d.size || 4);
    const minSize = nodes && Math.min(...fileSizes);
    const maxSize = nodes && Math.max(...fileSizes);

    const sizeScale = d3
      .scalePow()
      .exponent(0.3)
      .domain([minSize, maxSize])
      .range([10, 30]);

    const handleNodeInteraction = (
      event: any,
      d: SourceAsNode,
      isHovering: boolean
    ) => {
      g.selectAll("circle")
        .filter((node: any) => node.sourceId !== d.sourceId)
        .style("opacity", isHovering ? 0.3 : 1)
        .style("fill", "#5ea4ff");

      g.selectAll("circle")
        .filter((node: any) => node.sourceId === d.sourceId)
        .style("fill", isHovering ? "#4f46e5" : "#5ea4ff");

      g.selectAll("text")
        .filter((node: any) => node.sourceId !== d.sourceId)
        .style("opacity", isHovering ? 0.3 : 1)
        .style("transform", "translateY(0)");

      g.selectAll("text")
        .filter((node: any) => node.sourceId === d.sourceId)
        .style("transform", isHovering ? "translateY(10px)" : "translateY(0)");
    };

    const simulation = d3
      .forceSimulation(nodes)
      .force("x", d3.forceX(centerX).strength(0.05))
      .force("y", d3.forceY(centerY).strength(0.05))
      .force("collision", d3.forceCollide(85))
      .on("tick", () => {
        const circles = g
          .selectAll("circle")
          .data(nodes ? nodes : [])
          .join("circle")
          .attr("cx", (d) => d.x)
          .attr("cy", (d) => d.y)
          .attr("r", (d) => {
            const fileSize = d.size || 4;
            return sizeScale(fileSize);
          })
          .attr("fill", "#5ea4ff")
          .call(drag as any)
          .on("mouseover", (event, d) => handleNodeInteraction(event, d, true))
          .on("mouseout", (event, d) => handleNodeInteraction(event, d, false))
          .on("click", function (event, d) {
            event.stopPropagation();
            zoomToNode(event, d);

            d3.select(svgRef.current)
              .selectAll("circle")
              .attr("stroke", "none")
              .attr("stroke-width", 0);

            d3.select(this).attr("stroke", "#4f46e5").attr("stroke-width", 2);
          });

        g.selectAll("text")
          .data(nodes ? nodes : [])
          .join("text")
          .attr("x", (d) => d.x)
          .attr("y", (d) => d.y + sizeScale(d.size || 4) + 20)
          .attr("text-anchor", "middle")
          .attr("fill", "#374151")
          .attr("font-size", "14px")
          .text((d) => formatText(d.name || "", 50));
      });

    const drag = d3
      .drag<SVGCircleElement, SourceAsNode>()
      .on("start", function (event, d: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
        handleNodeInteraction(event, d, true);
      })
      .on("drag", function (event, d: any) {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", function (event, d: any) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
        handleNodeInteraction(event, d, false);

        const trashBounds = trashRef.current?.getBoundingClientRect();
        const nodeX = event.sourceEvent.clientX;
        const nodeY = event.sourceEvent.clientY;

        if (
          trashBounds &&
          nodeX >= trashBounds.left &&
          nodeX <= trashBounds.right &&
          nodeY >= trashBounds.top &&
          nodeY <= trashBounds.bottom
        ) {
          handleDeleteSource(d.sourceId);
        }
      });

    return () => {
      simulation.stop();
    };
  }, [sources, deleteSource, refetchSources, trashRef]);

  if (isLoading && hasSources) {
    return <LoadingPage></LoadingPage>;
  }

  return (
    <>
      {bucket && bucket.userId === user?.id && (
        <div ref={trashRef} className="absolute left-3 top-3 cursor-pointer">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="p-0 m-0 bg-red-600 rounded-full p-2">
                <Trash size={20} className=" text-white" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Drag sources here to delete</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
      <svg ref={svgRef} className="w-full h-full hover:cursor-grab"></svg>
      {isDrawerOpen && bucketId && selectedSource && (
        <BucketDataDrawer
          sourceId={selectedSource?.sourceId}
          open={isDrawerOpen}
          setOpen={setDrawerOpen}
          bucketId={bucketId}
        />
      )}
    </>
  );
}

export default BucketGraph;
