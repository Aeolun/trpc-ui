import type { ParsedRouter } from "@aeolun/trpc-router-parser";
import ReactDOM from "react-dom/client";
import { RootComponent } from "./Root";
import "./index.css";
import "jsoneditor/dist/jsoneditor.css";
import type { RenderOptions } from "@src/render";

// this gets replaced with the parsed router object
const routerDefinition: ParsedRouter =
	"{{parsed_router}}" as unknown as ParsedRouter;

// Here are other options
export const options = "{{options}}" as unknown as RenderOptions;
const rootElement = document.getElementById("root");
if (!rootElement) {
	throw new Error("Root element not found");
}
const root = ReactDOM.createRoot(rootElement);
root.render(<RootComponent rootRouter={routerDefinition} options={options} />);
