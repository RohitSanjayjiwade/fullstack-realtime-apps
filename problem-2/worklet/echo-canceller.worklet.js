class EchoCanceller extends AudioWorkletProcessor {
  constructor() {
    super();
    this.h = new Float32Array(128).fill(0);
    this.mu = 0.0003;
    this.energy = 1e-8;
    this.alpha  = 0.995;
  }
  process(inputs, outputs) {
    const sys = inputs[0][0] || new Float32Array();
    const mic = inputs[1][0] || new Float32Array();
    const out = outputs[0][0];
    const N = this.h.length;

    for (let n=0; n<mic.length; n++) {
      let y = 0;
      for (let k=0; k<=n && k<N; k++) {
        y += this.h[k]*sys[n-k];
      }
      const e = mic[n] - y;
      out[n] = e;
      this.energy = this.alpha*this.energy + (1-this.alpha)*sys[n]*sys[n];
      const norm = this.energy + 1e-8;
      for (let k=0; k<=n && k<N; k++) {
        this.h[k] += (this.mu*e*sys[n-k])/norm;
      }
    }
    return true;
  }
}
registerProcessor('echo-canceller', EchoCanceller);