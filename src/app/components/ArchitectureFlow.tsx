"use client";

import React, { useState, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { FiLayers, FiCpu, FiDatabase, FiShield, FiSmartphone, FiX, FiCheckCircle } from "react-icons/fi";

// Custom node data types
interface NodeMetaData {
  title: string;
  role: string;
  tech: string[];
  latency: string;
  security: string;
}

const defaultNodesMetaData: Record<string, NodeMetaData> = {
  "1": {
    title: "Client Application",
    role: "User-facing mobile & web interfaces built for high responsiveness.",
    tech: ["Expo", "React Native", "Next.js"],
    latency: "< 45ms",
    security: "TLS 1.3 / HTTPS",
  },
  "2": {
    title: "Express Backend & RBAC Gateway",
    role: "Central API server handling token verification, rate limiting, and RBAC routes.",
    tech: ["Node.js", "Express", "JWT", "@rudranarayan01/logaccent"],
    latency: "12 - 25ms",
    security: "Bearer Auth / Rate Limited",
  },
  "3": {
    title: "AI Processing Service",
    role: "Multi-modal AI pipeline handling image analysis, speech-to-text, and generative drafts.",
    tech: ["OpenAI GPT-4o", "Whisper API", "Vision Engine"],
    latency: "350 - 800ms",
    security: "Encrypted Payload / Ephemeral",
  },
  "4": {
    title: "Supabase Relational Database",
    role: "Persistent SQL storage, asset file buckets, and row-level security policy engine.",
    tech: ["PostgreSQL", "Supabase Storage", "Row Level Security"],
    latency: "8 - 18ms",
    security: "AES-256 / RLS Enabled",
  },
};

const initialNodes: Node[] = [
  {
    id: "1",
    position: { x: 0, y: 110 },
    data: { label: "Client Layer (Expo / Next.js)" },
    style: {
      background: "#09090b",
      color: "#f4f4f5",
      border: "1px solid #3f3f46",
      borderRadius: "14px",
      padding: "12px 18px",
      fontSize: "13px",
      fontWeight: "500",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
    },
  },
  {
    id: "2",
    position: { x: 280, y: 30 },
    data: { label: "Express API & RBAC Middleware" },
    style: {
      background: "#09090b",
      color: "#34d399",
      border: "1px solid #059669",
      borderRadius: "14px",
      padding: "12px 18px",
      fontSize: "13px",
      fontWeight: "500",
      boxShadow: "0 0 20px -3px rgba(16, 185, 129, 0.2)",
    },
  },
  {
    id: "3",
    position: { x: 280, y: 190 },
    data: { label: "OpenAI Multimodal Engine" },
    style: {
      background: "#09090b",
      color: "#fb923c",
      border: "1px solid #ea580c",
      borderRadius: "14px",
      padding: "12px 18px",
      fontSize: "13px",
      fontWeight: "500",
      boxShadow: "0 0 20px -3px rgba(234, 88, 12, 0.2)",
    },
  },
  {
    id: "4",
    position: { x: 580, y: 110 },
    data: { label: "Supabase Storage & PostgreSQL" },
    style: {
      background: "#09090b",
      color: "#60a5fa",
      border: "1px solid #2563eb",
      borderRadius: "14px",
      padding: "12px 18px",
      fontSize: "13px",
      fontWeight: "500",
      boxShadow: "0 0 20px -3px rgba(37, 99, 235, 0.2)",
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    animated: true,
    style: { stroke: "#10b981", strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#10b981" },
  },
  {
    id: "e1-3",
    source: "1",
    target: "3",
    animated: true,
    style: { stroke: "#ea580c", strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#ea580c" },
  },
  {
    id: "e2-4",
    source: "2",
    target: "4",
    animated: true,
    style: { stroke: "#2563eb", strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#2563eb" },
  },
  {
    id: "e3-4",
    source: "3",
    target: "4",
    style: { stroke: "#2563eb", strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#2563eb" },
  },
];

export const ArchitectureFlow = () => {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("2");

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const selectedMeta = selectedNodeId ? defaultNodesMetaData[selectedNodeId] : null;

  return (
    <section id="architecture" className="w-full bg-neutral-950 py-20 px-4 text-neutral-100">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono uppercase tracking-widest mb-2">
              <FiLayers className="text-sm" /> Microservice Topography
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Interactive System Architecture
            </h2>
          </div>
          <p className="text-sm text-neutral-400 max-w-md">
            Click any node below to inspect runtime specs, data serialization security, and response latency.
          </p>
        </div>

        {/* Main Diagram Area */}
        <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-4 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-3 backdrop-blur-md">
          {/* Flow Container */}
          <div className="lg:col-span-2 h-[420px] w-full rounded-xl border border-neutral-800/80 bg-neutral-950 overflow-hidden shadow-2xl relative">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              fitView
              colorMode="dark"
            >
              <Background color="#262626" gap={20} size={1} />
              <Controls className="!bg-neutral-900 !border-neutral-800 !text-white !rounded-lg overflow-hidden" />
            </ReactFlow>

            <div className="absolute top-3 left-3 bg-neutral-900/90 border border-neutral-800 px-3 py-1 rounded-full text-[11px] font-mono text-neutral-400 backdrop-blur-sm pointer-events-none">
              ● Live Visualizer (Click Node to Inspect)
            </div>
          </div>

          {/* Node Inspector Drawer */}
          <div className="flex flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-950 p-5 h-[420px] overflow-y-auto">
            {selectedMeta ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between border-b border-neutral-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">
                      Node Spec Inspector
                    </span>
                    <h3 className="text-base font-semibold text-white mt-0.5">
                      {selectedMeta.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedNodeId(null)}
                    className="text-neutral-500 hover:text-white transition-colors"
                  >
                    <FiX className="text-base" />
                  </button>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed">
                  {selectedMeta.role}
                </p>

                {/* Tech Stack Tags */}
                <div>
                  <span className="text-[11px] text-neutral-500 font-mono block mb-1.5">
                    Stack Components
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedMeta.tech.map((t, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-neutral-900 border border-neutral-800 px-2 py-0.5 text-[11px] text-neutral-300 font-mono"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="rounded-lg bg-neutral-900/80 border border-neutral-800/80 p-2.5">
                    <span className="text-[10px] font-mono text-neutral-500 block">
                      Target Latency
                    </span>
                    <span className="text-xs font-semibold text-emerald-400 font-mono">
                      {selectedMeta.latency}
                    </span>
                  </div>

                  <div className="rounded-lg bg-neutral-900/80 border border-neutral-800/80 p-2.5">
                    <span className="text-[10px] font-mono text-neutral-500 block">
                      Security Protocol
                    </span>
                    <span className="text-xs font-semibold text-blue-400 font-mono truncate block">
                      {selectedMeta.security}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-neutral-500 space-y-2">
                <FiCpu className="text-2xl text-neutral-600" />
                <p className="text-xs">Select any architecture node on the left to view detailed service specs.</p>
              </div>
            )}

            <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-500">
              <span className="flex items-center gap-1">
                <FiCheckCircle className="text-emerald-400" /> Fully Decoupled
              </span>
              <span className="font-mono">JSON/REST API</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};