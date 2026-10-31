import React from 'react';
import {Composition} from 'remotion';
import {MegaNetEhrAd} from './MegaNetAd';
import {MegaNetAd} from './MegaNetErpAd';
import {MegaNetSentinelAd, SENTINEL_FPS, SENTINEL_FRAMES} from './MegaNetSentinelAd';
import {ASSISTANT_DURATION, MegaNetAssistantAd} from './MegaNetAssistantAd';
import {LEDGER_DURATION, LEDGER_FPS, MegaNetLedgerAd} from './MegaNetLedgerAd';
import {MegaNetProfitLossAd, PL_DURATION, PL_FPS} from './MegaNetProfitLossAd';
import {CF_DURATION, CF_FPS, MegaNetCashFlowAd} from './MegaNetCashFlowAd';

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
  <Composition
    id="MegaNetAssistantAd"
    component={MegaNetAssistantAd}
    durationInFrames={ASSISTANT_DURATION}
    fps={30}
    width={1080}
    height={1920}
    defaultProps={{mode: 'full' as const}}
  />
  <Composition
    id="MegaNetLedgerAd"
    component={MegaNetLedgerAd}
    durationInFrames={LEDGER_DURATION}
    fps={LEDGER_FPS}
    width={1080}
    height={1920}
    defaultProps={{debug: ''}}
  />
  <Composition
    id="MegaNetProfitLossAd"
    component={MegaNetProfitLossAd}
    durationInFrames={PL_DURATION}
    fps={PL_FPS}
    width={1080}
    height={1920}
    defaultProps={{debug: ''}}
  />
  <Composition
    id="MegaNetCashFlowAd"
    component={MegaNetCashFlowAd}
    durationInFrames={CF_DURATION}
    fps={CF_FPS}
    width={1080}
    height={1920}
    defaultProps={{debug: ''}}
  />
  </>
);
