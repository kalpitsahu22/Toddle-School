import React, { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getSmoothStepPath } from '@xyflow/react';
import { X } from 'lucide-react';

export const CustomEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  data,
  selected
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16
  });

  const edgeLabel = label || (data as Record<string, unknown>)?.label;
  const isExecutionActive = (data as Record<string, unknown>)?.isExecutionActive;

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: selected ? 3 : 2,
          stroke: isExecutionActive
            ? '#3B82F6'
            : selected
            ? '#60A5FA'
            : style.stroke || '#475569',
          strokeDasharray: isExecutionActive ? '6,6' : undefined,
          animation: isExecutionActive ? 'flow-dash 1s linear infinite' : undefined,
          transition: 'stroke 0.3s, stroke-width 0.3s'
        }}
      />
      {edgeLabel && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all'
            }}
            className="nodrag nopan"
          >
            <div
              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border shadow-md transition-all ${
                selected
                  ? 'bg-blue-900/90 border-blue-400 text-blue-200 ring-2 ring-blue-500/30'
                  : 'bg-slate-900/90 border-slate-700/80 text-slate-300 hover:border-slate-500'
              }`}
            >
              {String(edgeLabel)}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

CustomEdge.displayName = 'CustomEdge';
