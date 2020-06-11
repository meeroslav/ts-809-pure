export const createGain = (context: AudioContext, volume = 1): GainNode => {
  const filter = context.createGain();
  filter.gain.value = volume;
  return filter;
};

export const createPanner = (context: AudioContext, pan = 0): StereoPannerNode => {
  const filter = context.createStereoPanner();
  filter.pan.value = pan;
  return filter;
};

export const createLowPass = (context: AudioContext, frequency?: number): BiquadFilterNode => {
  const filter = context.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = frequency || context.sampleRate / 2;
  return filter;
};

export interface EchoNode extends AudioNode {
  time: AudioParam;
  volume: AudioParam;
}

export const createEcho = (context: AudioContext, time = 0, volume = 0): EchoNode => {
  const input = context.createGain();
  const output = context.createGain();
  const delay = context.createDelay();
  const delayGain = context.createGain();
  // connect sources
  input.connect(output);
  input.connect(delay);
  delay.connect(delayGain);
  delayGain.connect(output);
  delayGain.connect(delay);

  const setTime = (newTime: number) => {
    delay.delayTime.value = newTime;
  };

  const setVolume = (newVolume: number) => {
    delayGain.gain.value = newVolume;
  };

  setTime(time);
  setVolume(volume);

  Object.defineProperty(input, 'time', {
    get: () => delay.delayTime,
  });

  Object.defineProperty(input, 'volume', {
    get: () => delayGain.gain,
  });

  input.connect = (destination: AudioParam | AudioNode) => {
    if (destination instanceof AudioNode) {
      output.connect(destination);
      return destination;
    }
    return;
  };

  return (input as any) as EchoNode;
};
