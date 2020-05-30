export const createGain = (context: AudioContext, volume = 1): GainNode => {
  const filter = context.createGain();
  filter.gain.value = volume;
  return filter;
};

export const createLowPass = (context: AudioContext, frequency?: number): BiquadFilterNode => {
  const filter = context.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = frequency || context.sampleRate / 2;
  return filter;
};

export const createTrippleDelay = (context: AudioContext, time = 0.1, volume = 0.15): AudioNode => {
  const input = context.createGain();
  const output = context.createGain();

  const delay1 = context.createDelay();
  const delay1Gain = context.createGain();
  delay1.delayTime.value = time;
  delay1Gain.gain.value = volume;
  const delay2 = context.createDelay();
  const delay2Gain = context.createGain();
  delay2.delayTime.value = time;
  delay2Gain.gain.value = volume;
  const delay3 = context.createDelay();
  const delay3Gain = context.createGain();
  delay3.delayTime.value = time;
  delay3Gain.gain.value = volume;

  input.connect(output);
  input.connect(delay1);
  delay1.connect(delay1Gain);
  delay1Gain.connect(output);
  delay1Gain.connect(delay2);
  delay2.connect(delay2Gain);
  delay2Gain.connect(output);
  delay2Gain.connect(delay3);
  delay3.connect(delay3Gain);
  delay3Gain.connect(output);

  input.connect = (destination: AudioParam | AudioNode) => {
    if (destination instanceof AudioNode) {
      output.connect(destination);
      return destination;
    }
    return;
  };

  return input;
};
