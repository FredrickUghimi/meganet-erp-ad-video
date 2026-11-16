import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Audit, Bg, OffsetCtx, useFonts} from './common';
import {Scene1} from './Scene1';
import {Scene2} from './Scene2';
import {Scene3} from './Scene3';
import {Scene4} from './Scene4';
import {Scene5} from './Scene5';
import {Scene6} from './Scene6';
import {Scene7} from './Scene7';
import {PM_FPS, SCENES} from './timing';

const SCENE_COMPONENTS = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7];

export type PMProps = {audit?: boolean};

/** One scene on the shared background. Used by the per-scene compositions (PMScene1..7). */
export const PMScene: React.FC<PMProps & {n: number}> = ({n, audit}) => {
  useFonts();
  const S = SCENE_COMPONENTS[n - 1];
  return (
    <OffsetCtx.Provider value={SCENES[n - 1].start * PM_FPS}>
      <Bg />
      <S />
      <Audit on={!!audit} />
    </OffsetCtx.Provider>
  );
};

/** Full 62 s timeline (preview / stills). */
export const MegaNetPMAd: React.FC<PMProps> = ({audit}) => {
  useFonts();
  return (
    <AbsoluteFill>
      {SCENES.map((s, i) => {
        const S = SCENE_COMPONENTS[i];
        return (
          <Sequence key={s.id} from={s.start * PM_FPS} durationInFrames={s.dur * PM_FPS}>
            <OffsetCtx.Provider value={s.start * PM_FPS}>
              <Bg />
              <S />
            </OffsetCtx.Provider>
          </Sequence>
        );
      })}
      <Audit on={!!audit} />
    </AbsoluteFill>
  );
};
