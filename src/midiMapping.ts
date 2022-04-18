export class MidiMapping {
  private constructor() {}

  public static mapping: Record<number, Record<number, string>> = {
    0xb6: {
      0x1f: "CrossfaderMsb",
      0x3f: "CrossfaderLsb",
      0x0d: "HeadphoneMsb",
      0x2d: "HeadphoneLsb",
      0x0c: "HeadphoneMixMsb",
      0x2c: "HeadphoneMixLsb",
      0x08: "MasterMsb",
      0x28: "MasterLsb",
      0x40: "TraxEncoder",
      0x64: "TraxEncoderShifted",
      0x17: "0FilterMsb",
      0x37: "0FilterLsb",
      0x18: "1FilterMsb",
      0x38: "1FilterLsb",
    },
    0x96: {
      0x7a: "LibraryView",
      0x65: "LibraryBack",
      0x46: "0TraxButton",
      0x5d: "0TraxButtonShifted",
      0x47: "1TraxButton",
      0x5e: "1TraxButtonShifted",
    },
    0x90: {
      0x0b: "0Play",
      0x0c: "0Cue",
      0x58: "0Sync",
      0x75: "0SyncShifted",
      0x3f: "0Shift",
      0x54: "0Pfl",
      0x14: "0LoopButton",
      0x10: "0LoopIn",
      0x11: "0LoopOut",
      0x36: "0JogTouchButton",
      0x5e: "0SearchBackward",
      0x5f: "0SearchForward",
    },
    0xb0: {
      0x21: "0JogEncoderUntouched",
      0x22: "0JogEncoderTouched",
      0x00: "0TempoMsb",
      0x20: "0TempoLsb",
      0x04: "0GainMsb",
      0x24: "0GainLsb",
      0x07: "0EqHighMsb",
      0x27: "0EqHighLsb",
      0x0b: "0EqMidMsb",
      0x2b: "0EqMidLsb",
      0x0f: "0EqLowMsb",
      0x2f: "0EqLowLsb",
      0x13: "0VolumeMsb",
      0x33: "0VolumeLsb",
    },
    0x97: {
      0x00: "0Hotcue0",
      0x01: "0Hotcue1",
      0x02: "0Hotcue2",
      0x03: "0Hotcue3",
      0x21: "0BeatjumpBackward",
      0x22: "0BeatjumpForward",
      0x10: "0KillLow",
      0x11: "0KillMid",
      0x12: "0KillHigh",
    },
    0x98: {
      0x00: "0Hotcue0Shifted",
      0x01: "0Hotcue1Shifted",
      0x02: "0Hotcue2Shifted",
      0x03: "0Hotcue3Shifted",
    },
    0x91: {
      0x0b: "1Play",
      0x0c: "1Cue",
      0x58: "1Sync",
      0x75: "1SyncShifted",
      0x3f: "1Shift",
      0x54: "1Pfl",
      0x14: "1LoopButton",
      0x10: "1LoopIn",
      0x11: "1LoopOut",
      0x36: "1JogTouchButton",
      0x5e: "1SearchBackward",
      0x5f: "1SearchForward",
    },
    0xb1: {
      0x21: "1JogEncoderUntouched",
      0x22: "1JogEncoderTouched",
      0x00: "1TempoMsb",
      0x20: "1TempoLsb",
      0x04: "1GainMsb",
      0x24: "1GainLsb",
      0x07: "1EqHighMsb",
      0x27: "1EqHighLsb",
      0x0b: "1EqMidMsb",
      0x2b: "1EqMidLsb",
      0x0f: "1EqLowMsb",
      0x2f: "1EqLowLsb",
      0x13: "1VolumeMsb",
      0x33: "1VolumeLsb",
    },
    0x99: {
      0x00: "1Hotcue0",
      0x01: "1Hotcue1",
      0x02: "1Hotcue2",
      0x03: "1Hotcue3",
      0x21: "1BeatjumpBackward",
      0x22: "1BeatjumpForward",
      0x10: "1KillLow",
      0x11: "1KillMid",
      0x12: "1KillHigh",
    },
    0x9a: {
      0x00: "1Hotcue0Shifted",
      0x01: "1Hotcue1Shifted",
      0x02: "1Hotcue2Shifted",
      0x03: "1Hotcue3Shifted",
    },
  };

  private static reversedMapping: Record<string, [number, number]> = {};

  public static initReversedMapping() {
    for (const statusGroupKey in MidiMapping.mapping) {
      const statusGroup = MidiMapping.mapping[statusGroupKey];
      for (const midiNo in statusGroup) {
        const controlName = statusGroup[midiNo];
        MidiMapping.reversedMapping[controlName] = [statusGroupKey as unknown as number, midiNo as unknown as number]; // idk
      }
    }
  }

  public static getMidiForControl(controlName: string): [number, number] {
    return MidiMapping.reversedMapping[controlName];
  }
}
