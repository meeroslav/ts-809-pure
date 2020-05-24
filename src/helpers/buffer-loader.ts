export const loadBuffer = async (url: string, context: AudioContext): Promise<AudioBuffer> => {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await context.decodeAudioData(arrayBuffer);
  } catch (error) {
    console.error(`Could not decode audio data in ${url}`, error);
  }
  return null;
};
