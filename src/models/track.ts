export type TrackSequence = number[];

type TrackUrl = string;
type TrackNick = string;
type TrackVolume = number;
type TrackPan = number;
type TrackPitch = number;

export type TrackStateOFF = 0;
export type TrackStateON = 1;
export type TrackStateSOLO = 2;
export type TrackState = TrackStateOFF | TrackStateON | TrackStateSOLO;

export const TRACK_STATE_OFF: TrackStateOFF = 0;
export const TRACK_STATE_ON: TrackStateON = 1;
export const TRACK_STATE_SOLO: TrackStateSOLO = 2;

export type Track = [TrackNick, TrackUrl, TrackState, TrackVolume, TrackPan, TrackPitch, TrackSequence];

export const TRACK_NICK = 0;
export const TRACK_URL = 1;
export const TRACK_STATE = 2;
export const TRACK_VOLUME = 3;
export const TRACK_PAN = 4;
export const TRACK_PITCH = 5;
export const TRACK_SEQ = 6;

export type Tracks = Track[];
