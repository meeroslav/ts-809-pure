export type TrackSequence = number[];

type TrackUrl = string;
type TrackNick = string;

export type TrackStateOFF = 0;
export type TrackStateON = 1;
export type TrackStateSOLO = 2;
export type TrackState = TrackStateOFF | TrackStateON | TrackStateSOLO;

export const TRACK_STATE_OFF: TrackStateOFF = 0;
export const TRACK_STATE_ON: TrackStateON = 1;
export const TRACK_STATE_SOLO: TrackStateSOLO = 2;

export type Track = [
  TrackNick,
  TrackUrl,
  TrackState,
  TrackSequence
];

export const TRACK_NICK = 0;
export const TRACK_URL = 1;
export const TRACK_STATE = 2;
export const TRACK_SEQ = 3;

export type Tracks = Track[];
