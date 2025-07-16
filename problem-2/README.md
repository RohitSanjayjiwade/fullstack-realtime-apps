# Problem 2: Parallel Audio Stream Separation

## Design

- Capture system audio via `getDisplayMedia` and mic via `getUserMedia`.  
- Route both into an `AudioWorkletProcessor` implementing an NLMS echo canceller.  
- Output two streams: raw system audio and cleaned microphone audio.

## How to Run

1. Open `index.html` in Chrome.  
2. Click “Start Capture” and speak/play audio.  
3. Observe separate outputs in your speakers.

## Trade-offs & Limitations

- 128 taps, μ=3×10⁻⁴ is a good baseline—may take ~1–2 s to converge.
- You can layer browser AEC (enabled above) for an extra ~10 dB suppression.
- Residual echo when system audio is much louder than speech.