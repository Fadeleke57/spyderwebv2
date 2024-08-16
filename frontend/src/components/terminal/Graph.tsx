import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { Article, ArticleAsNode } from "@/types/article";
import { useState } from "react";
import { DataDrawer } from "./DataDrawer";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { LoadingPage } from "@/components/utility/Loading";

interface GraphProps {
  limit: number;
}

function Graph({ limit }: GraphProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:8000/articles/${limit}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const fetchedArticles: Article[] = response.data.result.flatMap(
          (innerArray: Article[]) => innerArray
        );
        setArticles(fetchedArticles);
      } catch (error) {
        setError("Failed to fetch article data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [limit]);

  useEffect(() => {
    if (articles.length) {
      setLoading(false);
      toast({
        title: `Loaded ${articles.length} articles.`,
      });
    } else {
      toast({
        title: "Welcome to SpydrWeb!",
        description: "Loading articles...",
      });
    }
  }, [articles]);

  useEffect(() => {
    const width = 3200;
    const height = 2400;
    const centerX = width / 8 + 80;
    const centerY = height / 8;
    const circleRadius = Math.min(width, height) / 2 - 50;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);
    setLoading(true);
    svg.selectAll("*").remove();

    const g = svg.append("g");

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom as any);

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
      .force("collision", d3.forceCollide(30)) //spacing so make it dynamic later
      .on("tick", () => {
        g.selectAll("circle")
          .data(nodes)
          .join("circle")
          .attr("cx", (d) => d.x)
          .attr("cy", (d) => d.y)
          .attr("r", 15)
          .attr("fill", () => "#5ea4ff")
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
          .attr("fill", "#5ea4ff");
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
    setLoading(false); 

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [articles]);

  if (loading) {
    return <LoadingPage></LoadingPage>;
  }

  return (
    <>
      <svg ref={svgRef} className="w-full h-full hover:cursor-grab"></svg>
      <DataDrawer
        article={selectedArticle as ArticleAsNode}
        open={isDrawerOpen}
        setOpen={setDrawerOpen}
      />
    </>
  );
}

export default Graph;
