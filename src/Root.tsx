import React from 'react';
import {Composition} from 'remotion';
import {MegaNetAd, MegaNetEhrAd} from './MegaNetAd';
import {ASSISTANT_DURATION, MegaNetAssistantAd} from './MegaNetAssistantAd';

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
    id="MegaNetAssistantAd"
    component={MegaNetAssistantAd}
    durationInFrames={ASSISTANT_DURATION}
    fps={30}
    width={1080}
    height={1920}
    defaultProps={{mode: 'full' as const}}
  />
  </>
);
