export const motionSources = {
  logo: require("../assets/motion/logo.json"),
  success: require("../assets/motion/success.json"),
  empty: require("../assets/motion/empty.json"),
};
export type MotionArtProps = {
  kind: keyof typeof motionSources;
  size?: number;
  active?: boolean;
};
