"use client";
import React from "react";
import { ReactFlow, Background, Controls } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const initialNodes = [
  {
    id: "1",
    position: { x: 0, y: 100 },
    data: { label: "Client Request / API Gateway" },
    style: { background: "#171717", color: "#fff", border: "1px solid #404040", borderRadius: "12px", padding: "10px" },
  },
  {
    id: "2",
    position: { x: 250, y: 30 },
    data: { label: "Node.js Express / Auth Middleware" },
    style: { background: "#171717", color: "#34d399", border: "1px solid #059669", borderRadius: "12px", padding: "10px" },
  },
  {
    id: "3",
    position: { x: 250, y: 170 },
    data: { label: "OpenAI API / Vision & Text Pipeline" },
    style: { background: "#171717", color: "#f35626", border: "1px solid #ea580c", borderRadius: "12px", padding: "10px" },
  },
  {
    id: "4",
    position: { x: 520, y: 100 },
    data: { label: "Database / Supabase & Storage" },
    style: { background: "#171717", color: "#60a5fa", border: "1px solid #2563eb", borderRadius: "12px", padding: "10px" },
  },
];

const initialEdges = [
  { id: "e1-2", source: "1", target: "2", animated: true, style: { stroke: "#a3a3a3" } },
  { id: "e1-3", source: "1", target: "3", animated: true, style: { stroke: "#ea580c" } },
  { id: "e2-4", source: "2", target: "4", style: { stroke: "#2563eb" } },
  { id: "e3-4", source: "3", target: "4", style: { stroke: "#2563eb" } },
];

export const ArchitectureFlow = () => {
  return (
    <section className="w-full max-w-5xl mx-auto py-12 px-4">
      <div className="mb-6 text-left">
        <h3 className="text-2xl font-bold text-white">System Architecture Playground</h3>
        <p className="text-sm text-neutral-400">Interactive node-graph showing how data flows through my decoupled AI microservices.</p>
      </div>

      <div className="h-[360px] w-full rounded-2xl border border-neutral-800 bg-neutral-950 overflow-hidden shadow-inner">
        <ReactFlow nodes={initialNodes} edges={initialEdges} fitView>
          <Background color="#262626" gap={16} />
          <Controls className="bg-neutral-900 border-neutral-800 fill-white" />
        </ReactFlow>
      </div>
    </section>
  );
};