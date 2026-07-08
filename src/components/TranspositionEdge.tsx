import { BaseEdge, type EdgeProps } from '@xyflow/react';
import type { MoveFlowEdge } from '../types/index.ts';

export function TranspositionEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  label,
  labelStyle,
  labelShowBg,
  labelBgStyle,
  labelBgPadding,
  labelBgBorderRadius,
  markerStart,
  markerEnd,
  interactionWidth,
  style,
}: EdgeProps<MoveFlowEdge>) {
  const graphBottom = data?.graphBottom ?? Math.max(sourceY, targetY) + 100;
  const arcY = graphBottom + 60;

  const path = `M ${sourceX},${sourceY} C ${sourceX},${arcY} ${targetX},${arcY} ${targetX},${targetY}`;

  const labelX = (sourceX + targetX) / 2;
  const labelY = 0.125 * (sourceY + targetY) + 0.75 * arcY;

  return (
    <BaseEdge
      path={path}
      labelX={labelX}
      labelY={labelY}
      label={label}
      labelStyle={labelStyle}
      labelShowBg={labelShowBg}
      labelBgStyle={labelBgStyle}
      labelBgPadding={labelBgPadding}
      labelBgBorderRadius={labelBgBorderRadius}
      markerStart={markerStart}
      markerEnd={markerEnd}
      interactionWidth={interactionWidth}
      style={style}
    />
  );
}
