import { Navigation, A11y } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import Image from 'next/image';

import { ChevronLeft, ChevronRight } from '@strapi/icons';

import styles from './styles.module.css';
import 'swiper/css';

export default function Carousel({ screenshots }) {
  return (
    <Swiper
      className={styles.carousel}
      modules={[Navigation, A11y]}
      slidesPerView={2}
      spaceBetween={30}
      navigation={{
        nextEl: '.custom-next',
        prevEl: '.custom-prev',
      }}
      pagination={{ clickable: true }}
      onSwiper={(swiper) => console.log(swiper)}
      onSlideChange={() => console.log('slide change')}
      onInit={(swiper) => {
        swiper.navigation.init();
        swiper.navigation.update();
      }}
    >
      {screenshots.map((screenshot) => (
        <SwiperSlide className={styles.carousselSlider}>
          <Image
            className={styles.carousselScreenshot}
            src={process.env.NEXT_PUBLIC_CMS_URL + screenshot.url}
            width={screenshot.width}
            height={screenshot.height}
          />
        </SwiperSlide>
      ))}
      <button className={`custom-prev ${styles.prevButton}`}>
        <ChevronLeft className={styles.iconButton} />
      </button>
      <button className={`custom-next ${styles.nextButton}`}>
        <ChevronRight className={styles.iconButton} />
      </button>
    </Swiper>
  );
}
