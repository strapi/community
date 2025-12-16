'use client';

import { shuffle } from 'lodash';
import { useEffect, useState } from 'react';
import styles from '@/app/css/layout.module.css';

const Shape = ({
  shape,
  opacity = 100,
  rotate = 0,
}: {
  shape: string;
  opacity?: number;
  rotate?: number;
}) => {
  if (shape === 'lShape') {
    return (
      <span
        className={`${styles[shape]} ${styles['opacity' + opacity]} ${
          styles['rotate' + rotate]
        }`}
      >
        <span></span>
        <span></span>
      </span>
    );
  }

  return (
    <span
      className={`${styles[shape]} ${styles['opacity' + opacity]} ${
        styles['rotate' + rotate]
      }`}
    ></span>
  );
};

export function ShapesArray() {
  const [windowInnerWidth, setWindowInnerWidth] = useState(0);
  const shapes = shuffle(['circle', 'triangle', 'lShape', 'semiCircle']);
  const opacity = [5, 10, 20, 30];
  const rotate = [0, 90, 180, 270];

  useEffect(() => {
    setWindowInnerWidth(window.innerWidth);
  }, []);

  const draw = () => {
    if (!windowInnerWidth) {
      return [];
    }

    const numberOfShapesRequired = Math.round(windowInnerWidth / (18 * 2)); // 100
    const arrayShapes: Array<string> = [];

    const pickShape = (
      arrayShapes: Array<string>,
      prevIndex: number,
      shape?: string
    ): string => {
      if (!shape || arrayShapes[prevIndex] === shape) {
        const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
        return pickShape(arrayShapes, prevIndex, randomShape);
      }

      return shape;
    };

    for (let index = 0; index < numberOfShapesRequired; index++) {
      arrayShapes.push(pickShape(arrayShapes, index - 1));
    }

    return [
      ...arrayShapes.map((shape, index) => {
        const randomOpacity =
          opacity[Math.floor(Math.random() * opacity.length)];
        const randomRotate = rotate[Math.floor(Math.random() * rotate.length)];

        return (
          <Shape
            key={`shape${index}`}
            shape={shape}
            opacity={randomOpacity}
            rotate={randomRotate}
          />
        );
      }),
    ];
  };

  return draw();
}
