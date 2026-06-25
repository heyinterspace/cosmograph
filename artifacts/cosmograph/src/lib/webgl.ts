// The galaxy is a WebGL/Three.js experience with no 2D fallback path, so before
// mounting <Canvas> we check whether the browser can actually create a WebGL
// context. When it can't (old GPU, hardware acceleration off, WebGL disabled,
// locked-down work machine), we render a friendly screen instead of letting the
// renderer throw and blank the whole page.
export function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    return Boolean(gl);
  } catch {
    return false;
  }
}
