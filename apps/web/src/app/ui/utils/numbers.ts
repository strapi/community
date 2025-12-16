export function formatDownloads(downloads: number) {
  // Downloads
  let displayedDownloads: string = downloads.toString();
  let displayShortcutLetterDownloads: string = '';

  if (downloads >= 1000000) {
    displayedDownloads = Math.round(downloads / 1000000).toString();
    displayShortcutLetterDownloads = 'M';
  } else if (downloads >= 1000) {
    const modulo = downloads % 1000;
    const toFixed = modulo ? 1 : 0;

    displayedDownloads = Number.parseFloat(downloads / 1000)
      .toFixed(toFixed)
      .toString();
    displayShortcutLetterDownloads = 'k';
  }

  return displayedDownloads + displayShortcutLetterDownloads;
}

export function formatStars(stars: number) {
  // Stars
  let displayedStars: string = stars.toString();
  let displayShortcutLetterStars: string = '';

  if (stars >= 1000) {
    const modulo = stars % 1000;
    const toFixed = modulo ? 1 : 0;
    displayedStars = Number.parseFloat(stars / 1000)
      .toFixed(toFixed)
      .toString();
    displayShortcutLetterStars = 'k';
  }

  return displayedStars + displayShortcutLetterStars;
}
