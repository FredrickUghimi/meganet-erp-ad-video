import React from 'react';
import {Composition} from 'remotion';
import {MegaNetAd} from './MegaNetAd';

export const Root: React.FC = () => (
  <Composition
    id="MegaNetAd"
    component={MegaNetAd}
    durationInFrames={600}
    fps={30}
    width={1080}
    height={1920}
  />
);
