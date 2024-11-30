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

interface GraphProps {
  setConfig: (value: BucketConfigFormValues) => void;
  bucketId: string;
  hasSources: boolean;
  fetchedSources: Source[];
  setFetchedSources: Dispatch<SetStateAction<Source[]>>;
  selectedSourceId: string | null;
  setSelectedSourceId: Dispatch<SetStateAction<string | null>>;
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
    const centerX = width / 8 + 40;
    const centerY = height / 8 - 70;
    const circleRadius = Math.min(width, height) / 2 - 50;

    const zoomToNode = (event: MouseEvent | null, d: SourceAsNode) => {
      if (event) event.stopPropagation();

      const scale = 3;
      const [x, y] = [d.x + centerX - 20, d.y + centerY + 40];

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

    const tooltip = svg
      .append("g")
      .attr("class", "tooltip")
      .style("opacity", 0);

    tooltip
      .append("text")
      .attr("fill", "#333")
      .attr("font-size", "18px")
      .attr("font-weight", "bold")
      .attr("text-anchor", "middle");

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

    const simulation = d3
      .forceSimulation(nodes)
      .force("x", d3.forceX(centerX).strength(0.05))
      .force("y", d3.forceY(centerY).strength(0.05))
      .force("collision", d3.forceCollide(35))
      .on("tick", () => {
        g.selectAll("circle")
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
          .on("click", function (event, d) {
            event.stopPropagation();
            zoomToNode(event, d);
          })
          .on("mouseover", function (event, d) {
            const [mouseX, mouseY] = d3.pointer(event);
            const transform = d3.zoomTransform(svg.node() as Element);

            tooltip
              .style("opacity", 1)
              .style("weight", "bold")
              .attr(
                "transform",
                `translate(${transform.applyX(d.x)},${transform.applyY(
                  d.y - 20
                )})`
              );

            tooltip.select("text").text(formatText(d.name || "", 55));
          })
          .on("mouseout", function () {
            tooltip.style("opacity", 0);
            tooltip.style("opacity", 0);
          });
      });

    const drag = d3
      .drag<SVGCircleElement, SourceAsNode>()
      .on("start", function (event, d: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", function (event, d: any) {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", function (event, d: any) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;

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
                <Trash className="w-6 h-6 text-white" />
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
