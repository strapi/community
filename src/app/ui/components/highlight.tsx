import { HighlightCard, Plugin } from './highlightCard';

export function Highlight({ plugins }: { plugins: Array<Plugin> }) {
  return plugins.map((plugin) => (
    <HighlightCard
      name={plugin.name}
      description={plugin.description}
      stars={plugin.stars}
      downloads={plugin.downloads}
    />
  ));
}
