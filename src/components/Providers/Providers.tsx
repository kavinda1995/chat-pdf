"use client";

import {FC} from "react";
import {QueryClient} from "@tanstack/query-core";
import {QueryClientProvider} from "@tanstack/react-query";

type Props = {
	children: React.ReactNode
}

const queryClient = new QueryClient();

export const Providers: FC<Props> = ({
	children
}) => {
	return (
		<QueryClientProvider client={ queryClient }>
			{children}
		</QueryClientProvider>
	)
}
