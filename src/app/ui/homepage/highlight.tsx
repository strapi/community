import { Package } from '@/app/definitions';

import HighlightCard from '@/app/ui/homepage/highlightCard';

import { Flex } from '@strapi/design-system';

import styles from '@/app/css/homepage.module.css';
import { useEffect, useState, useRef } from 'react';
import { fetchPackagesHighlighted } from '@/app/lib/data';

export default function Highlight() {
  const [packages, setPackages] = useState<Package[]>([]);
  const isMounted = useRef(false);

  const fetchData = async () => {
    const data = await fetchPackagesHighlighted(4);

    setPackages(data);
  };

  useEffect(() => {
    if (!isMounted.current) {
      fetchData();
      isMounted.current = true;
    }
  }, [fetchData]);

  if (!packages.length) {
    return <p></p>;
  }

  return (
    <div>
      <h2 className={styles.title}>Highlighted plugins</h2>
      <Flex
        className={styles.highlight}
        alignItems={'flex-start'}
        justifyContent={'space-evenly'}
        direction={'row'}
        gap={'16px'}
        width={'100%'}
      >
        {packages.map((pkg, index) => (
          <HighlightCard
            key={`pkg_${index}`}
            className={styles.highlight}
            name={pkg.name}
            description={pkg.description}
            stars={pkg.stars}
            downloads={pkg.downloads}
          />
        ))}
      </Flex>
    </div>
  );
}
