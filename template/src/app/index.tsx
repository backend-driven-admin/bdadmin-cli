import { createRoot } from "react-dom/client";
import "./index.css";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import router from "./router";

const queryClient = useQueryClient();

createRoot(document.getElementById("root") as HTMLElement).render(
	<QueryClientProvider client={queryClient}>
		<RouterProvider router={router} />
	</QueryClientProvider>,
);
