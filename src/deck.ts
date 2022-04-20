import { MidiControl } from "@controls/midiControl";
import { DeckMidiControl } from "@controls/deckMidiControl";
import { DeckFineMidiControl } from "@controls/deckFineMidiControl";
import { DeckButton } from "@controls/deckButton";
import { toggleControl, activate, makeLedConnection, clamp, setLed } from "@/utils";
import { MidiMapping } from "./midiMapping";

export class Deck {
  public readonly index: number;
  public readonly controls: MidiControl[];
  private readonly connections: Connection[] = [];
  private readonly group: string;

  private readonly rateControl: DeckFineMidiControl;

  constructor(readonly channel: number) {
    this.index = channel - 1;
    this.group = `[Channel${channel}]`;

    const eqGroup = `[EqualizerRack1_${this.group}_Effect1]`;
    const filterEffectGroup = `[QuickEffectRack1_${this.group}]`;

    this.controls = [
      new DeckButton(this.index, "Play", {
        onPressed: () => {
          this.toggleControl("play");
        },
      }),
      new DeckButton(this.index, "Sync", {
        onPressed: () => {
          this.activate("beatsync");
        },
      }),
      new DeckButton(this.index, "Pfl", {
        onPressed: () => {
          this.toggleControl("pfl");
        },
      }),

      // Loop
      new DeckButton(this.index, "LoopButton", {
        onPressed: () => {
          this.activate(`beatloop_${this.getValue("beatloop_size")}_toggle`);
        },
      }),

      // Loop size
      new DeckButton(this.index, "LoopIn", {
        onPressed: () => {
          this.activate("loop_halve");
        },
      }),
      new DeckButton(this.index, "LoopOut", {
        onPressed: () => {
          this.activate("loop_double");
        },
      }),

      // Gain
      new DeckFineMidiControl(this.index, "Gain", {
        onValueChanged: (value) => {
          this.setParameter("pregain", value);
        },
      }),

      // EQ
      new DeckFineMidiControl(this.index, "EqLow", {
        onValueChanged: (value) => {
          engine.setParameter(eqGroup, "parameter1", value);
        },
      }),
      new DeckFineMidiControl(this.index, "EqMid", {
        onValueChanged: (value) => {
          engine.setParameter(eqGroup, "parameter2", value);
        },
      }),
      new DeckFineMidiControl(this.index, "EqHigh", {
        onValueChanged: (value) => {
          engine.setParameter(eqGroup, "parameter3", value);
        },
      }),

      // Quick Effect / Filter
      new DeckFineMidiControl(this.index, "Filter", {
        onValueChanged: (value) => {
          engine.setParameter(filterEffectGroup, "super1", value);
        },
      }),

      new DeckFineMidiControl(this.index, "Volume", {
        onValueChanged: (value) => {
          this.setParameter("volume", value);
        },
      }),

      // Beatjump
      new DeckButton(this.index, "BeatjumpBackward", {
        onPressed: () => {
          this.activate("beatjump_backward");
        },
      }),
      new DeckButton(this.index, "BeatjumpForward", {
        onPressed: () => {
          this.activate("beatjump_forward");
        },
      }),

      // Beatjump size
      new DeckButton(this.index, "SearchBackward", {
        onPressed: () => {
          this.modifyAndClampBeatjumpSize(0.5);
        },
      }),
      new DeckButton(this.index, "SearchForward", {
        onPressed: () => {
          this.modifyAndClampBeatjumpSize(2);
        },
      }),

      // Jog wheel
      new DeckButton(this.index, "JogTouchButton", {
        onPressed: () => {
          const alpha = 1.0 / 8;
          const beta = alpha / 32;
          engine.scratchEnable(channel, 16384, 33 + 1 / 3, alpha, beta, false);
        },
        onReleased: () => {
          engine.scratchDisable(channel, false);
        },
      }),
      new DeckMidiControl(this.index, "JogEncoderTouched", false, {
        onNewValue: (value) => {
          if (engine.isScratching(this.channel)) {
            engine.scratchTick(this.channel, value - 0x40);
          }
        },
      }),
      new DeckMidiControl(this.index, "JogEncoderUntouched", false, {
        onNewValue: (value) => {
          if (!engine.isScratching(this.channel)) {
            const centeredValue = value - 0x40;
            this.setParameter("jog", centeredValue * 0.25);
          }
        },
      }),

      // Crossfader assignment
      new DeckButton(this.index, "CrossfaderAssignLeft", {
        onPressed: () => this.activate("orientation_left"),
      }),
      new DeckButton(this.index, "CrossfaderAssignCenter", {
        onPressed: () => this.activate("orientation_center"),
      }),
      new DeckButton(this.index, "CrossfaderAssignRight", {
        onPressed: () => this.activate("orientation_right"),
      }),
    ];

    this.rateControl = new DeckFineMidiControl(this.index, "Tempo", {
      onValueChanged: (value) => {
        this.setParameter("rate", 1 - value);
      },
    });
    this.controls.push(this.rateControl);

    // Hotcues
    const hotcueIndices = [0, 1, 2, 3];
    hotcueIndices.forEach((hotcueIndex) => {
      const hotcueNumber = hotcueIndex + 1;

      this.controls.push(
        new DeckButton(this.index, `Hotcue${hotcueIndex}`, {
          onValueChanged: (pressed) => {
            this.setValue(`hotcue_${hotcueNumber}_activate`, pressed);
          },
        })
      );
      this.controls.push(
        new DeckButton(this.index, `Hotcue${hotcueIndex}Shifted`, {
          onPressed: () => {
            this.activate(`hotcue_${hotcueNumber}_clear`);
          },
        })
      );

      this.makeLedConnection(`hotcue_${hotcueNumber}_enabled`, `Hotcue${hotcueIndex}`, 0x02); // blue
      this.makeLedConnection(`hotcue_${hotcueNumber}_enabled`, `Hotcue${hotcueIndex}Shifted`, 0x29); // red
    });

    // Load track
    this.controls.push(
      new DeckButton(this.index, "TraxButton", {
        onPressed: () => {
          this.activate("LoadSelectedTrack");
        },
      })
    );

    // Eject track
    this.controls.push(
      new DeckButton(this.index, "TraxButtonShifted", {
        onPressed: () => {
          if (!this.getValue("play")) this.activate("eject");
        },
      })
    );

    // SoftTakeover
    engine.softTakeover(this.group, "rate", true);

    // Leds
    this.makeLedConnection("play", "Play");
    this.makeLedConnection("pfl", "Pfl");
    this.makeLedConnection("loop_enabled", "LoopButton");

    // Beatjump buttons
    setLed(`${this.index}BeatjumpBackward`, 0x15); // green
    setLed(`${this.index}BeatjumpForward`, 0x15);

    this.triggerConnections();
  }

  private triggerConnections() {
    for (const connection of this.connections) {
      connection.trigger();
    }
  }

  private modifyAndClampBeatjumpSize(factor: number) {
    this.setValue("beatjump_size", clamp((this.getValue("beatjump_size") as number) * factor, 0.03125, 128));
  }

  private getParameter(key: string): number {
    return engine.getParameter(this.group, key);
  }

  private setParameter(key: string, value: number) {
    engine.setParameter(this.group, key, value);
  }

  private getValue(key: string): number | boolean {
    return engine.getValue(this.group, key);
  }

  private setValue(key: string, value: number | boolean) {
    engine.setValue(this.group, key, value);
  }

  private activate(key: string) {
    activate(this.group, key);
  }

  private toggleControl(key: string) {
    toggleControl(this.group, key);
  }

  private makeConnection(key: string, callback: ConnectionCallback) {
    this.connections.push(engine.makeConnection(this.group, key, callback));
  }

  private makeLedConnection(key: string, controlName: string, ledValue: number = 0x7f) {
    const [status, midiNo] = MidiMapping.getMidiForControl(`${this.index}${controlName}`);
    this.connections.push(makeLedConnection(this.group, key, status, midiNo, ledValue));
  }
}
