import React, { useRef, useEffect, useCallback } from "react";
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
import { updateTextElements, isSafari, shouldUseTspans } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "next-themes";
import {
  formatText,
  mapThemeToBaseNodeColor,
  mapThemetoHoverNodeColor,
  mapThemeToTextColor,
} from "@/lib/utils";
import { D3Selection } from "@/types/graph";

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
  const svgRef = useRef<SVGSVGElement | null>(null);

  const isMobile = useIsMobile();

  const { user } = useUser();
  const { theme } = useTheme();

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
        .translate(-x + (isMobile ? -260 : 0), -y);

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
        .style("fill", mapThemeToBaseNodeColor(theme));

      g.selectAll("circle")
        .filter((node: any) => node.sourceId === d.sourceId)
        .style(
          "fill",
          isHovering
            ? mapThemetoHoverNodeColor(theme)
            : mapThemeToBaseNodeColor(theme)
        );
      g.selectAll("text")
        .filter((node: any) => node.sourceId !== d.sourceId)
        .style("opacity", isHovering ? 0.3 : 1)
        .style("transform", "translateY(0)");

      g.selectAll("text")
        .filter((node: any) => node.sourceId === d.sourceId)
        .style("opacity", 1)
        .style("transform", isHovering ? "translateY(10px)" : "translateY(0)")
        .style("transition", "transform 0.3s ease");

      g.selectAll("foreignObject")
        .filter((node: any) => node.sourceId !== d.sourceId)
        .style("opacity", isHovering ? 0.3 : 1)
        .style("transform", "translateY(0)");

      g.selectAll("foreignObject")
        .filter((node: any) => node.sourceId === d.sourceId)
        .style("opacity", 1)
        .style("transform", isHovering ? "translateY(10px)" : "translateY(0)")
        .style("transition", "transform 0.3s ease");
    };

    const simulation = d3
      .forceSimulation(nodes)
      .force("x", d3.forceX(centerX).strength(0.05))
      .force("y", d3.forceY(centerY).strength(0.05))
      .force("collision", d3.forceCollide(95))
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
          .attr("fill", mapThemeToBaseNodeColor(theme))
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

            d3.select(this)
              .attr("stroke", mapThemetoHoverNodeColor(theme))
              .attr("stroke-width", 2);
          });

        if (!shouldUseTspans) {
          g.selectAll("foreignObject")
            .data(nodes || [])
            .join("foreignObject")
            .attr("width", 300)
            .attr("height", 100)
            .attr("x", (d) => d.x - 150)
            .attr("y", (d) => d.y + sizeScale(d.size || 4) + 5)
            .html(
              (d) => `
          <div style="
            font-size: 14px;
            color: ${mapThemeToTextColor(theme)};
            text-align: center;
            display: flex;
            flex-direction: column;
            white-space: normal;
            overflow: hidden;
            line-height: 1.2em;
            word-wrap: break-word;
            font-weight: bold;
          ">
            ${formatText(d.name, 60)}
          </div>
        `
            );
        } else
          updateTextElements(
            g,
            nodes,
            theme as string,
            mapThemeToTextColor,
            (size) => sizeScale(size),
            formatText
          );
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
              <TooltipTrigger className="p-0 m-0 bg-red-600 dark:bg-muted rounded-full p-2">
                <Trash size={20} className="text-white dark:text-foreground" />
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
