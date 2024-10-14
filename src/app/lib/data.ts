import { z } from 'zod';

export async function fetchStatistics() {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return { plugins: 1243, providers: 669 };
}
