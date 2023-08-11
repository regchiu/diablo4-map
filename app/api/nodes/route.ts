import { isOverwolf } from "@/app/lib/env";
import nodes, { NODE, NODE_TYPE } from "@/app/lib/nodes";
import { NextRequest, NextResponse } from "next/server";

async function _GET(request: NextRequest) {
  const search = request.nextUrl.search;
  const q = new URLSearchParams(search).get("q")?.toLowerCase();
  if (!q) {
    return NextResponse.json(nodes);
  }
  const result = {
    ...Object.keys(nodes).reduce((acc, key) => {
      acc[key as NODE_TYPE] = [];
      return acc;
    }, {} as Record<NODE_TYPE, NODE[]>),
  };

  Object.entries(nodes).forEach(([key, items]) => {
    items.forEach((node) => {
      if (
        node.name.toLowerCase().includes(q) ||
        ("attribute" in node && node.attribute.toLowerCase().includes(q))
      ) {
        result[key as NODE_TYPE].push(node);
      }
    });
  });

  return NextResponse.json(result);
}

export const GET = isOverwolf ? undefined : _GET;
