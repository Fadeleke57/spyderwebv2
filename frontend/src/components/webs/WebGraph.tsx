import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { useState, Dispatch, SetStateAction } from "react";
import { LoadingPage } from "@/components/utility/Loading";
import { useDeleteSource, useFetchSourcesForWeb } from "@/hooks/sources";
import { Source, SourceAsNode } from "@/types/source";
import { Trash } from "lucide-react";
import { updateTextElements, shouldUseTspans } from "@/lib/utils";
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
import SourceTooltip from "./SourceToolTip";
import { Connection } from "@/types/connection";
import SpydrAI from "../utility/Assistant";
import { useSourceStore } from "@/store/sourceStore";
import WebDataModal from "./WebDataModal";
import { useRouter } from "next/router";
import { useFetchAllConnectionsForWeb } from "@/hooks/connections";
import { useFetchWebById } from "@/hooks/webs";
import { useAuthorization } from "@/providers/AuthorizationProvider";
import { ACCEPTED_FILE_TYPES } from "@/lib/constants";
import { toast } from "@/components/ui/use-toast";

interface GraphProps {
  hasSources: boolean;
  fetchedSources: Source[];
  setFetchedSources: Dispatch<SetStateAction<Source[]>>;
  sourcesLoading: boolean;
  handleFileUpload: (files: FileList | null) => void;
  connections: Connection[];
  connectionsLoading: boolean;
}

function WebGraph({
  hasSources,
  fetchedSources,
  sourcesLoading,
  handleFileUpload,
  connections,
  connectionsLoading,
}: GraphProps) {
  const router = useRouter();
  const { webId } = router.query;
  const { canWrite } = useAuthorization();
  const { refetch: refetchConnectionsForWeb } = useFetchAllConnectionsForWeb(
    webId as string
  );

  const { refetch: refetchSourcesForWeb } = useFetchSourcesForWeb(
    webId as string
  );

  const { refetch: refetchWeb } = useFetchWebById(webId as string);

  const {
    setIsUploadingSource,
    setSelectedSourceId,
    source: selectedSource,
    setSource: setSelectedSource,
    hasDroppedFiles,
    setHasDroppedFiles,
  } = useSourceStore();

  const [isDragging, setIsDragging] = useState(false);
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setHasDroppedFiles(true);
    toast({
      title: "Files Dropped",
      description: "Files have been dropped",
    });

    const acceptedFileTypes = ACCEPTED_FILE_TYPES;
    const isAcceptedFile = (file: File) =>
      acceptedFileTypes.some((type) => file.name.toLowerCase().endsWith(type));

    const fileList: File[] = [];

    const readAllEntries = async (directoryReader: any): Promise<any[]> => {
      const entries: any[] = [];
      let readEntries: any[];
      do {
        readEntries = await new Promise<any[]>((resolve) => {
          directoryReader.readEntries(resolve);
        });
        entries.push(...readEntries);
      } while (readEntries.length > 0);
      return entries;
    };

    const processEntry = async (entry: any) => {
      if (entry.isFile) {
        const file = await new Promise<File>((resolve) => {
          entry.file((f: File) => resolve(f));
        });
        if (isAcceptedFile(file)) {
          fileList.push(file);
        }
      } else if (entry.isDirectory) {
        const reader = entry.createReader();
        const entries = await readAllEntries(reader);
        for (const childEntry of entries) {
          await processEntry(childEntry);
        }
      }
    };

    const items = Array.from(e.dataTransfer.items);

    if (items.length > 0) {
      for (const item of items) {
        if (item.kind === "file") {
          const entry = item.webkitGetAsEntry?.();
          if (entry) {
            await processEntry(entry);
          } else {
            const file = item.getAsFile();
            if (file && isAcceptedFile(file)) {
              fileList.push(file);
            }
          }
        }
      }

      if (fileList.length > 0) {
        handleFileUpload(fileList as any);
      }
    } else if (e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter(isAcceptedFile);
      if (files.length > 0) {
        handleFileUpload(files as any);
      }
    }

    setIsUploadingSource(false);
  };

  const trashRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const isMobile = useIsMobile();
  const { theme } = useTheme();
  const [hoveredSource, setHoveredSource] = useState<Source | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const { mutateAsync: deleteSource } = useDeleteSource(webId as string);

  const handleDeleteSource = async (sourceId: string) => {
    if (fetchedSources.length === 1) {
      await deleteSource(sourceId);
      window.location.reload();
    } else {
      await deleteSource(sourceId);
      refetchConnectionsForWeb();
      refetchSourcesForWeb();
      refetchWeb();
    }
  };

  useEffect(() => {
    if (
      !svgRef.current ||
      !fetchedSources ||
      fetchedSources.length === 0 ||
      !connections ||
      connectionsLoading ||
      sourcesLoading
    ) {
      return;
    }
    const width = 3200;
    const height = 2400;
    const centerX = width / 8 + (isMobile ? -220 : 40);
    const centerY = height / 8 - 70;

    const initialCircleRadius = 200; //nodes start closer together
    const targetCircleRadius = Math.min(width, height) / 2 - 50;

    const zoomToNode = (event: MouseEvent | null, d: SourceAsNode) => {
      if (event) event.stopPropagation();
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

    const initialScale = isMobile ? 0.4 : 0.6;
    const initialTransform = d3.zoomIdentity
      .translate(width / 4, height / 4)
      .scale(initialScale);

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.transition()
          .duration(50)
          .ease(d3.easeLinear)
          .attr("transform", event.transform);
      });

    svg.call(zoom as any);

    const linksGroup = g.append("g").attr("class", "links");
    const nodeIdSet = new Set(fetchedSources.map((s) => s.sourceId));

    const links =
      connections
        ?.filter(
          (connection: Connection) =>
            nodeIdSet.has(connection.fromSourceId) &&
            nodeIdSet.has(connection.toSourceId)
        )
        .map((connection: Connection) => ({
          source: connection.fromSourceId,
          target: connection.toSourceId,
        })) || [];

    const nodes: SourceAsNode[] =
      fetchedSources &&
      fetchedSources.map((d: Source, i: number) => {
        const angle = (i / fetchedSources.length) * 2 * Math.PI;
        const x = centerX + initialCircleRadius * Math.cos(angle);
        const y = centerY + initialCircleRadius * Math.sin(angle);
        return { ...d, x, y };
      });

    const lines = linksGroup
      .selectAll("line")
      .data(links)
      .join("line")
      .style("stroke", "#ccc")
      .style("stroke-width", 3.5)
      .style("opacity", 0);

    const linkForce = d3
      .forceLink(links)
      .id((d: any) => d.sourceId)
      .distance(200)
      .strength(0); //start with no link force

    const collisionForce = d3.forceCollide(120).strength(0); //start with no collision

    const centeringForce = d3.forceCenter(centerX, centerY).strength(0.05);

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
      if (isHovering && !isMobile) {
        setHoveredSource(d);
        setTooltipPosition({
          x: event.pageX,
          y: event.pageY,
        });
      } else {
        setHoveredSource(null);
        setTooltipPosition(null);
      }

      const neighborIds = new Set<string>();
      if (isHovering) {
        links.forEach((link: any) => {
          if (link.source.sourceId === d.sourceId) {
            neighborIds.add(link.target.sourceId);
          } else if (link.target.sourceId === d.sourceId) {
            neighborIds.add(link.source.sourceId);
          }
        });
      }

      g.selectAll("circle")
        .filter(
          (node: any) =>
            node.sourceId !== d.sourceId && !neighborIds.has(node.sourceId)
        )
        .style("transition", "fill 0.7s ease")
        .style("transition", "opacity 0.7s ease")
        .style("opacity", isHovering ? 0.3 : 1)
        .style("fill", mapThemeToBaseNodeColor(theme));

      g.selectAll("circle")
        .filter(
          (node: any) =>
            node.sourceId === d.sourceId || neighborIds.has(node.sourceId)
        )
        .style("transition", "fill 0.7s ease")
        .style(
          "fill",
          isHovering
            ? mapThemetoHoverNodeColor(theme)
            : mapThemeToBaseNodeColor(theme)
        );

      g.selectAll("text")
        .filter(
          (node: any) =>
            node.sourceId !== d.sourceId && !neighborIds.has(node.sourceId)
        )
        .style("transition", "opacity 0.7s ease")
        .style("opacity", isHovering ? 0.3 : 1)
        .style("transform", "translateY(0)");

      g.selectAll("text")
        .filter((node: any) => node.sourceId === d.sourceId)
        .style("opacity", 1)
        .style("transform", isHovering ? "translateY(10px)" : "translateY(0)")
        .style("transition", "transform 0.3s ease");

      g.selectAll("foreignObject")
        .filter(
          (node: any) =>
            node.sourceId !== d.sourceId && !neighborIds.has(node.sourceId)
        )
        .style("transition", "opacity 0.7s ease")
        .style("opacity", isHovering ? 0.3 : 1)
        .style("transform", "translateY(0)");

      g.selectAll("foreignObject")
        .filter((node: any) => node.sourceId === d.sourceId)
        .style("opacity", 1)
        .style("transform", isHovering ? "translateY(10px)" : "translateY(0)")
        .style("transition", "transform 0.3s ease");

      linksGroup
        .selectAll("line")
        .style(
          "transition",
          "opacity 0.7s ease, stroke-width 0.7s ease, stroke 0.7s ease"
        )
        .style("opacity", (l: any) => {
          if (!isHovering) return 0.6;
          return l.source.sourceId === d.sourceId ||
            l.target.sourceId === d.sourceId
            ? 0.8
            : 0.2;
        })
        .style("stroke-width", (l: any) => {
          if (!isHovering) return 3.5;
          return l.source.sourceId === d.sourceId ||
            l.target.sourceId === d.sourceId
            ? 4
            : 3.5;
        })
        .style("stroke", (l: any) => {
          if (!isHovering) return "#ccc";
          return l.source.sourceId === d.sourceId ||
            l.target.sourceId === d.sourceId
            ? mapThemetoHoverNodeColor(theme)
            : "#ccc";
        });
    };

    const simulation = d3
      .forceSimulation(nodes)
      .force("x", d3.forceX(centerX).strength(0.01)) //start with weak centering
      .force("y", d3.forceY(centerY).strength(0.01))
      .force("collision", collisionForce)
      .force("link", linkForce)
      .force("center", centeringForce)
      .alphaDecay(0.01) //slower decay for smoother animation
      .velocityDecay(0.3); //add some "friction" for smoother movement

    //gradually introduce forces
    let phase = 0;
    simulation.on("tick", () => {
      phase += 1;

      //gradually strengthen forces
      if (phase === 10) {
        linkForce.strength(0.1);
        collisionForce.strength(0.2);
      }
      if (phase === 30) {
        linkForce.strength(0.2);
        collisionForce.strength(0.5);
      }
      if (phase === 50) {
        linkForce.strength(0.3);
        collisionForce.strength(1);

        //fade in the lines
        lines.transition().duration(300).style("opacity", 0.6);
      }

      //update positions
      lines
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

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
          setHoveredSource(null);
          setTooltipPosition(null);
          event.stopPropagation();
          zoomToNode(event, d);

          d3.select(svgRef.current)
            .selectAll("circle")
            .attr("stroke", "none")
            .attr("stroke-width", 0);

          d3.select(this)
            .attr("stroke", mapThemetoHoverNodeColor(theme))
            .attr("stroke-width", 3.5);
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
  }, [
    fetchedSources,
    deleteSource,
    refetchSourcesForWeb,
    trashRef,
    connections,
    theme,
  ]);

  if ((connectionsLoading || sourcesLoading) && hasSources) {
    return <LoadingPage></LoadingPage>;
  }

  if (hasDroppedFiles) {
    return <LoadingPage></LoadingPage>;
  }

  return (
    <div
      className={`h-full ${isDragging ? "cursor-grabbing border border-dashed border-blue-500 border-2 rounded-md" : ""}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute text-center rounded-md top-2 left-2 left-0 z-50 w-3/4 bg-white font-semibold text-black">
          Drag and drop files or folders here.
        </div>
      )}
      {canWrite && (
        <div ref={trashRef} className="absolute left-3 top-3 cursor-pointer">
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger className="p-0 m-0 bg-red-600 dark:bg-transparent dark:hover:bg-red-500 rounded-full p-2 transition-colors ease-in">
                <Trash size={20} className="text-white dark:text-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Drag sources here to delete</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
      {!isMobile && (
        <div className="absolute right-8 bottom-28 cursor-pointer">
          <SourceTooltip source={hoveredSource} position={tooltipPosition}>
            <div>Here</div>
          </SourceTooltip>
        </div>
      )}
      <svg ref={svgRef} className="w-full h-full hover:cursor-grab"></svg>
      {isDrawerOpen && webId && selectedSource && (
        <WebDataModal open={isDrawerOpen} setOpen={setDrawerOpen} />
      )}
      <div className="absolute bottom-4 right-4">
        <SpydrAI />
      </div>
    </div>
  );
}

export default WebGraph;
