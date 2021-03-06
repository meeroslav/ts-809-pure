import { TRACK_STATE_OFF, TRACK_STATE_ON, TRACK_STATE_SOLO, Tracks } from './models/track';

// prettier-ignore
export const demoRhythm: Tracks = [
  [
    'kick',
    'Kick_MeloCubic.wav',
    TRACK_STATE_SOLO,
    1,
    0,
    0,
    [
      1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0,
    ],
  ],
  [
    'snare',
    'Snare_MeloCubic.wav',
    TRACK_STATE_SOLO,
    1,
    0,
    0,
    [
      0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0,
    ],
  ],
  [
    'perc',
    'DnB_Perc_15.wav',
    TRACK_STATE_ON,
    1,
    -.2,
    -5,
    [ 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0 ],
  ],
  [
    'hh1',
    'Hihat_Brazil02.wav',
    TRACK_STATE_ON,
    0.8,
    0,
    1,
    [ 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1 ],
  ],
  [
    'hh2',
    'Hihat_Brazil01.wav',
    TRACK_STATE_ON,
    0.5,
    0,
    1,
    [ 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0 ],
  ],
  [
    'djembe3',
    'Djembe03_FAT.wav',
    TRACK_STATE_ON,
    1,
    0,
    0,
    [ 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0 ],
  ],
  [
    'djembe4',
    'Djembe04_FAT.wav',
    TRACK_STATE_ON,
    .8,
    0,
    0,
    [ 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0 ],
  ],
  [
    'djembe5',
    'Djembe05_FAT.wav',
    TRACK_STATE_ON,
    1,
    0,
    0,
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
  ],
  [
    'bassC',
    'C_NoisyLiveBass01.wav',
    TRACK_STATE_ON,
    1,
    0,
    0,
    [ 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0 ]
  ],
  [
    'bassF',
    'F_FizzyBass01.wav',
    TRACK_STATE_ON,
    1,
    0,
    -5,
    [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
  ],
  [
    'vox',
    'VoxDelay2_FX.wav',
    TRACK_STATE_ON,
    0.5,
    0.29,
    3,
    [ 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
  ],
  [
    'd# pad1',
    'Dmaj_ChasmPadHit.wav',
    TRACK_STATE_ON,
    0.4,
    0,
    7,
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
  ],
  [
    'd# pad2',
    'Dmaj_TailnicePadHit.wav',
    TRACK_STATE_ON,
    0.6,
    0,
    -5,
    [ 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0 ]
  ],
];
