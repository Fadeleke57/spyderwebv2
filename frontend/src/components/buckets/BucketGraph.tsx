import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import {
  Article,
  ArticleAsNode,
  BucketConfigFormValues,
} from "@/types/article";
import { useState, Dispatch, SetStateAction } from "react";
import { DataDrawer } from "../terminal/DataDrawer";
import { LoadingPage } from "@/components/utility/Loading";
import { useCollectSourcesForBucket } from "@/hooks/generation";
import { useFetchArticlesForBucket } from "@/hooks/buckets";
import BucketDataDrawer from "./BucketDataDrawer";

interface GraphProps {
  config: BucketConfigFormValues;
  setConfig: (value: BucketConfigFormValues) => void;
  bucketId: string;
  hasArticles: boolean;
  fetchedArticles: Article[];
  setFetchedArticles: Dispatch<SetStateAction<Article[]>>;
  selectedArticleId: string | null;
  setSelectedArticleId: Dispatch<SetStateAction<string | null>>;
}

function BucketGraph({
  config,
  setConfig,
  bucketId,
  hasArticles,
  fetchedArticles,
  setFetchedArticles,
  selectedArticleId,
  setSelectedArticleId,
}: GraphProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const { generateSourcesForBucket, loading, error } = useCollectSourcesForBucket(
    bucketId,
    config,
  );
  const { articles, loading: articlesLoading, error: articlesError } = useFetchArticlesForBucket(
    bucketId
  )

  useEffect(() => {
    setFetchedArticles(articles);
    const width = 3200;
    const height = 2400;
    const centerX = width / 8 + 40;
    const centerY = height / 8 - 70;
    const circleRadius = Math.min(width, height) / 2 - 50;

    const zoomToNode = (event: MouseEvent | null, d: ArticleAsNode) => {
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

      setSelectedArticle(d);
      setSelectedArticleId(d.id);
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

    const nodes: ArticleAsNode[] = articles.map((d, i) => {
      const angle = (i / articles.length) * 2 * Math.PI;
      const x = centerX + circleRadius * Math.cos(angle);
      const y = centerY + circleRadius * Math.sin(angle);
      return { ...d, x, y };
    });
    console.log("nodes", nodes);

    const sizeScale = d3
      .scalePow()
      .exponent(2) // more or less exponential scaling
      .domain([0, 100])
      .range([5, 50]);

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
            const reliabilityScore = d.reliability_score ?? 0;
            return sizeScale(reliabilityScore);
          })
          .attr("fill", (d) => "#5ea4ff")
          .call(drag as any)
          .on("click", function (event, d) {
            event.stopPropagation();
            zoomToNode(event, d);
          });
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

    // cleanup
    return () => {
      simulation.stop();
    };
  }, [articles]);

  if (articlesLoading && hasArticles) {
    return <LoadingPage></LoadingPage>;
  }

  return (
    <>
      <svg ref={svgRef} className="w-full h-full hover:cursor-grab"></svg>
      {isDrawerOpen && (
        <BucketDataDrawer
          source={selectedArticle as ArticleAsNode}
          open={isDrawerOpen}
          setOpen={setDrawerOpen}
          config={config}
        />
      )}
    </>
  );
}

export default BucketGraph;