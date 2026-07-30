import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { SetBetRequestDto, ValidationErrorDto } from '@/shared/api';
import { auctionKeys, getErrorMessage, getValidationErrors, setBet } from '@/shared/api';
import { showErrorToast, showSuccessToast } from '@/shared/ui';

interface UseSetBetOptions {
  onValidationError: (errors: ValidationErrorDto[]) => void;
  onSuccess: () => void;
}

export function useSetBet(auctionUuid: string, options: UseSetBetOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SetBetRequestDto) => setBet(auctionUuid, request),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: auctionKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: auctionKeys.detail(auctionUuid) }),
        queryClient.invalidateQueries({ queryKey: auctionKeys.bets(auctionUuid) }),
      ]);

      showSuccessToast('Ставка принята');
      options.onSuccess();
    },

    onError: (error) => {
      const errors = getValidationErrors(error);

      if (errors !== null && errors.length > 0) {
        options.onValidationError(errors);
        return;
      }

      showErrorToast(getErrorMessage(error));
    },
  });
}
