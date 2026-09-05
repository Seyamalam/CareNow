import Svg, { Rect, Path, Circle } from "react-native-svg";
import { usePalette } from "../lib/theme";
import type { VehicleKind } from "../shared/transport";
/** Original fleet silhouettes; shared proportions keep cards and markers consistent. */
export function VehicleArt({
  kind,
  size = 76,
  selected = false,
}: {
  kind: VehicleKind;
  size?: number;
  selected?: boolean;
}) {
  const p = usePalette(),
    body = selected ? p.primary : p.soft,
    glass = p.secondary;
  return (
    <Svg width={size} height={size * 0.6} viewBox="0 0 100 60">
      <Path
        d="M10 49H90"
        stroke={p.border}
        strokeWidth={3}
        strokeLinecap="round"
      />
      {kind === "truck" ? (
        <>
          <Rect x={6} y={14} width={48} height={29} rx={4} fill={body} />
          <Path d="M57 24H76L89 36V45H57Z" fill={body} />
          <Path d="M63 28H73L81 36H63Z" fill={glass} />
          <Path
            d="M16 20V35M27 20V35M38 20V35"
            stroke={p.card}
            strokeOpacity={0.35}
            strokeWidth={2}
          />
        </>
      ) : (
        <>
          <Path
            d={
              kind === "bus"
                ? "M9 12H80Q90 12 90 23V44H7V21Q7 12 9 12Z"
                : "M10 19H65Q76 19 80 27L90 38V45H7V28Q7 19 10 19Z"
            }
            fill={body}
          />
          <Rect
            x={kind === "bus" ? 14 : 51}
            y={kind === "bus" ? 18 : 24}
            width={kind === "bus" ? 64 : 21}
            height={13}
            rx={3}
            fill={glass}
          />
          {kind === "bus" && (
            <Path
              d="M30 17V34M47 17V34M64 17V34"
              stroke={body}
              strokeWidth={3}
            />
          )}
        </>
      )}
      {kind === "ambulance" && (
        <>
          <Rect x={22} y={23} width={6} height={16} rx={1} fill={p.card} />
          <Rect x={17} y={28} width={16} height={6} rx={1} fill={p.card} />
          <Rect x={46} y={14} width={13} height={4} rx={2} fill={p.danger} />
        </>
      )}
      {kind === "accessible" && (
        <>
          <Circle cx={27} cy={26} r={3} fill={p.card} />
          <Path
            d="M26 31L29 36H36M26 31V36M24 34A7 7 0 1 0 34 41"
            stroke={p.card}
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
          />
        </>
      )}
      <Circle cx={24} cy={44} r={8} fill={p.ink} />
      <Circle cx={24} cy={44} r={3} fill={p.card} />
      <Circle cx={75} cy={44} r={8} fill={p.ink} />
      <Circle cx={75} cy={44} r={3} fill={p.card} />
      <Rect x={86} y={36} width={5} height={4} rx={1} fill={p.sand} />
    </Svg>
  );
}
