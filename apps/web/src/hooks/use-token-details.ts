import { useQuery } from "@tanstack/react-query";
import { Token } from "@/types/token";
import { Api } from "@/lib/axios";

export function useTokenDetails(token: string | undefined, network: number) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["token", token, network],
    queryFn: async (): Promise<Token> => {
      const response = await Api.get<Token>(`/token`, {
        params: {
          network,
          token,
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
