import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { Article, ArticleAsNode } from "@/types/article";
import { useState } from "react";
import { LoadingPage } from "@/components/utility/Loading";
import { useFetchArticlesDemo } from "@/hooks/articles";
import { ConfigFormValues } from "@/types/article";
import { DataDrawerDemo } from "./DataDrawerDemo";

interface GraphProps {
  limit: number;
  config: ConfigFormValues;
  setConfig: (value: ConfigFormValues) => void;
  color: string;
}

function Graph({ limit, config, setConfig, color }: GraphProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const { articles, loading, error } = useFetchArticlesDemo(
    limit,
    config,
    setConfig
  );

  useEffect(() => {
    const width = 3200;
    const height = 2400;
    const centerX = width / 8 - 90;
    const centerY = height / 8 - 10;
    const circleRadius = Math.min(width, height) / 2 - 50;

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

    const colorScale = d3
      .scaleLinear<string>()
      .domain([-1, 1])
      .interpolate(d3.interpolateRgb)
      .range([
        d3.rgb(color).darker(0.2).toString(),
        d3.rgb(color).brighter(0.2).toString(),
      ]);

    const nodes: ArticleAsNode[] = articles.map((d, i) => {
      const angle = (i / articles.length) * 2 * Math.PI;
      const x = centerX + circleRadius * Math.cos(angle);
      const y = centerY + circleRadius * Math.sin(angle);
      return { ...d, x, y };
    });

    const simulation = d3
      .forceSimulation(nodes)
      .force("x", d3.forceX(centerX).strength(0.05))
      .force("y", d3.forceY(centerY).strength(0.05))
      .force("collision", d3.forceCollide(30)) // Spacing; make dynamic later
      .on("tick", () => {
        g.selectAll("circle")
          .data(nodes)
          .join("circle")
          .attr("cx", (d) => d.x)
          .attr("cy", (d) => d.y)
          .attr("r", 15)
          .attr("fill", (d) => colorScale(d.sentiment)) // Use the sentiment score to determine the fill color
          .call(drag as any)
          .on("click", (event, d) => {
            setSelectedArticle(d);
            setDrawerOpen(true);
          });

        g.selectAll("text")
          .data(nodes)
          .join("text")
          .attr("x", (d) => d.x)
          .attr("y", (d) => d.y - 20)
          .attr("text-anchor", "middle")
          .style("font-size", "12px")
          .style("font-weight", "bold")
          .text((d) => (d.header ? d.header.slice(0, 10) + "..." : ""))
          .attr("fill", (d) => colorScale(d.sentiment));
      });

    const drag = d3
      .drag<SVGCircleElement, ArticleAsNode>()
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

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [articles, color]);

  if (loading) {
    return <LoadingPage></LoadingPage>;
  }

  return (
    <>
      <svg ref={svgRef} className="w-full h-full hover:cursor-grab"></svg>
      <DataDrawerDemo
        open={isDrawerOpen}
        setOpen={setDrawerOpen}
        article={selectedArticle as ArticleAsNode}
        color={color}
      />
    </>
  );
}

export default Graph;
