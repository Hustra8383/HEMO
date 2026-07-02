/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo } from 'react';
import { FullHEMOState } from '../types';
import { getPartnerState, PartnerState } from '../utils/partnerState';

/**
 * Custom React Hook that returns the synchronized partnerState, memoized for high-performance UI updates.
 */
export function usePartnerState(state: FullHEMOState | null): PartnerState | null {
  return useMemo(() => getPartnerState(state), [state]);
}
