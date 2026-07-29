import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  CreateBetRequestDto,
  CreateBetResponseDto,
  ValidationErrorItemDto,
} from '@/shared/api';
import { auctionKeys, createBet, getErrorMessage, getValidationDetail } from '@/shared/api';
import { showErrorToast, showSuccessToast } from '@/shared/ui';

interface UseCreateBetOptions {
  onValidationError: (issues: ValidationErrorItemDto[]) => void;
  onSuccess: (response: CreateBetResponseDto) => void;
}

export function useCreateBet(auctionUuid: string, options: UseCreateBetOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateBetRequestDto) => createBet(auctionUuid, request),

    onSuccess: async (response) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: auctionKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: auctionKeys.detail(auctionUuid) }),
        queryClient.invalidateQueries({ queryKey: auctionKeys.bets(auctionUuid) }),
      ]);

      showSuccessToast('Ставка принята');
      options.onSuccess(response);
    },

    onError: (error) => {
      const issues = getValidationDetail(error);

      if (issues !== null && issues.length > 0) {
        options.onValidationError(issues);
        return;
      }

      showErrorToast(getErrorMessage(error));
    },
  });
}
