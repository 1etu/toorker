import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { Layout } from "@/components/layout/layout";
import { TsfPalette } from "@/features/tsf/tsf-palette";

const windowLabel = getCurrentWebviewWindow().label;

export const App = () => {
  if (windowLabel === "palette") { return <TsfPalette />; }
  return <Layout />;
};
