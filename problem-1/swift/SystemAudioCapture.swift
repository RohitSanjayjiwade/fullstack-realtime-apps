import AVFoundation

let engine = AVAudioEngine()
let mixer = engine.mainMixerNode
let format = mixer.outputFormat(forBus: 0)

do {
    try engine.enableManualRenderingMode(
        .offline,
        format: format,
        maximumFrameCount: 4096
    )
    try engine.start()

    while true {
        let buffer = AVAudioPCMBuffer(
            pcmFormat: format,
            frameCapacity: 4096
        )!
        let status = try engine.renderOffline(buffer.frameCapacity, to: buffer)
        if status == .success {
            guard let channelData = buffer.floatChannelData else { continue }
            let floatData = Data(bytes: channelData[0], count: Int(buffer.frameLength) * MemoryLayout<Float>.size)
            FileHandle.standardOutput.write(floatData)
        } else {
            break
        }
    }
} catch {
    fputs("Error: \(error)\n", stderr)
    exit(1)
}
