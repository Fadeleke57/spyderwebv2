import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import {
  BucketConfigFormValues,
} from "@/types/article";
import { useState, Dispatch, SetStateAction } from "react";
import { LoadingPage } from "@/components/utility/Loading";
import BucketDataDrawer from "./BucketDataDrawer";
import { useFetchSourcesForBucket } from "@/hooks/sources";
import { Source, SourceAsNode } from "@/types/source";

interface GraphProps {
  config: BucketConfigFormValues;
  setConfig: (value: BucketConfigFormValues) => void;
  bucketId: string;
  hasSources: boolean;
  fetchedSources: Source[];
  setFetchedSources: Dispatch<SetStateAction<Source[]>>;
  selectedSourceId: string | null;
  setSelectedSourceId: Dispatch<SetStateAction<string | null>>;
}

function BucketGraph({
  config,
  bucketId,
  hasSources,
  fetchedSources,
  setFetchedSources,
  selectedSourceId,
  setSelectedSourceId,
}: GraphProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const {
    sources,
    isLoading,
    error: sourcesError,
  } = useFetchSourcesForBucket(bucketId);

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

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom as any);

    const nodes: SourceAsNode[] = sources.map((d: Source, i) => {
      const angle = (i / sources.length) * 2 * Math.PI;
      const x = centerX + circleRadius * Math.cos(angle);
      const y = centerY + circleRadius * Math.sin(angle);
      return { ...d, x, y };
    });

    // Calculate min and max file sizes
    const fileSizes = nodes.map((d) => d.size || 4); // Default to 4 if size is missing
    const minSize = Math.min(...fileSizes);
    const maxSize = Math.max(...fileSizes);

    const sizeScale = d3
      .scalePow()
      .exponent(0.3) // Change the exponent for finer control; 0.5 makes scaling subtler
      .domain([minSize, maxSize])
      .range([10,30]);

    const simulation = d3
      .forceSimulation(nodes)
      .force("x", d3.forceX(centerX).strength(0.05))
      .force("y", d3.forceY(centerY).strength(0.05))
      .force("collision", d3.forceCollide(35)) //spacing
      .on("tick", () => {
        g.selectAll("circle")
          .data(nodes)
          .join("circle")
          .attr("cx", (d) => d.x)
          .attr("cy", (d) => d.y)
          .attr("r", (d) => {
            const fileSize = d.size || 4;
            return sizeScale(fileSize);
          })
          .attr("fill", (d) => "#5ea4ff")
          .call(drag as any)
          .on("click", function (event, d) {
            event.stopPropagation();
            zoomToNode(event, d);
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
      });

    // cleanup
    return () => {
      simulation.stop();
    };
  }, [sources]);

  if (isLoading && hasSources) {
    return <LoadingPage></LoadingPage>;
  }

  return (
    <>
      <svg ref={svgRef} className="w-full h-full hover:cursor-grab"></svg>
      {isDrawerOpen && (
        <BucketDataDrawer
          source={selectedSource as SourceAsNode}
          open={isDrawerOpen}
          setOpen={setDrawerOpen}
          config={config}
        />
      )}
    </>
  );
}

export default BucketGraph;
