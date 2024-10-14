import { countMany } from './cms';

export async function fetchStatistics() {
  try {
    const packages = await countMany('packages');

    console.log(packages);

    return { plugins: 1243, providers: 669 };
  } catch (e) {
    console.log(e);
    throw new Error('Failed to fetch statistics.');
  }
}
