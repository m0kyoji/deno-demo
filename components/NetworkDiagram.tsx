import { useEffect, useRef } from "preact/hooks";
import * as d3 from "https://cdn.skypack.dev/d3@7.8.0?dts";

interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  description: string;
}

interface Link {
  source: string;
  target: string;
}

interface NetworkData {
  nodes: Node[];
  links: Link[];
}

interface NetworkDiagramProps {
  data: NetworkData;
  width: number;
  height: number;
}

export default function NetworkDiagram({ data, width, height }: NetworkDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const simulation = d3.forceSimulation(data.nodes)
        .force("link", d3.forceLink(data.links).id((d: any) => d.id))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
        .selectAll("line")
        .data(data.links)
        .join("line")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6);

    const drag = d3.drag<SVGGElement, Node>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);

    const node = svg.append("g")
        .selectAll("g")
        .data(data.nodes)
        .join("g")
        .call(drag as any);

    node.append("circle")
        .attr("r", 5)
        .attr("fill", "#69b3a2");

    node.append("text")
        .attr("dx", 12)
        .attr("dy", ".35em")
        .text(d => d.name)
        .style("font-size", "12px")
        .style("fill", "#333");

    simulation.on("tick", () => {
      link
          .attr("x1", (d: any) => d.source.x)
          .attr("y1", (d: any) => d.source.y)
          .attr("x2", (d: any) => d.target.x)
          .attr("y2", (d: any) => d.target.y);

      node
          .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

  }, [data, width, height]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
}