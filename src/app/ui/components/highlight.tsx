import { HighlightCard } from './highlightCard';

import { Flex } from '@strapi/design-system';

import styles from '@/app/css/homepage.module.css';

export function Highlight({ plugins }: { plugins: Array<Plugin> }) {
  return (
    <div>
      <h2 className={styles.title}>Highlighted plugins</h2>
      <Flex
        className={styles.highlight}
        alignItems={'flex-start'}
        direction={'row'}
        gap={'16px'}
        width={'100%'}
      >
        {plugins.map((plugin, index) => (
          <HighlightCard
            key={`plugin${index}`}
            className={styles.highlight}
            name={plugin.name}
            description={plugin.description}
            stars={plugin.stars}
            downloads={plugin.downloads}
          />
        ))}
      </Flex>
    </div>
  );
}
