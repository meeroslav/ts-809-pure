export const getContext = () => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (AudioContext) {
    return new AudioContext();
  }
  return null;
};
