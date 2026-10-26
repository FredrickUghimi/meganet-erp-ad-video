import React from 'react';
import {Composition} from 'remotion';
import {MegaNetEhrAd} from './MegaNetAd';
import {MegaNetAd} from './MegaNetErpAd';
import {MegaNetSentinelAd, SENTINEL_FPS, SENTINEL_FRAMES} from './MegaNetSentinelAd';

export const Root: React.FC = () => (
  <>
  <Composition
    id="MegaNetAd"
    component={MegaNetAd}
    durationInFrames={600}
    fps={30}
    width={1080}
    height={1920}
  />
  <Composition
    id="MegaNetEhrAd"
    component={MegaNetEhrAd}
    durationInFrames={600}
    fps={30}
    width={1080}
    height={1920}
  />
  <Composition
    id="MegaNetSentinelAd"
    component={MegaNetSentinelAd}
    durationInFrames={SENTINEL_FRAMES}
    fps={SENTINEL_FPS}
    width={1080}
    height={1920}
  />
  </>
);
