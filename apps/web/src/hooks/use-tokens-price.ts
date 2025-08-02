import { useQuery } from "@tanstack/react-query";
import { Api } from "@/lib/axios";

export function useTokenPrice(token: string[], network: number | undefined) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["token-price", network, token],
    queryFn: async (): Promise<Record<string, string>> => {
      const response = await Api.get<Record<string, string>>(`/token/price`, {
        params: {
          network,
          token: token?.join(","),
        },
      });

      return response.data;
    },
    enabled: !!token && !!network,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return { data, isLoading, error };
}
