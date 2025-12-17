import HighlightCard from '@/components/HighLightCard/highlightCard';

import { Flex } from '@strapi/design-system';

import styles from './styles.module.css';

export default function Highlight() {
  const packages = [{}];

  return (
    <div>
      <h2 className={styles.title}>Highlighted plugins</h2>
      <Flex
        alignItems={'flex-start'}
        justifyContent={'space-evenly'}
        direction={'row'}
        gap={'16px'}
        width={'100%'}
      >
        {packages.map((pkg, index) => (
          <HighlightCard
            key={`pkg_${index}`}
            name={pkg.name}
            description={pkg.description}
            stars={pkg.stars}
            downloads={pkg.downloads}
            slug={pkg.slug}
          />
        ))}
      </Flex>
    </div>
  );
}
