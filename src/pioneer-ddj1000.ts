import { Button } from "./controls/button";

import { activate, toggleControl } from "./utils";
import { MidiControl } from "./controls/midiControl";
import { MidiMapping } from "./midiMapping";
import { FineMidiControl } from "./controls/fineMidiControl";
import { Deck } from "./deck";

let decks: Deck[];
let deckIndependentControls: MidiControl[];

const controls: MidiControl[] = [];

export function init(): void {
  MidiMapping.initReversedMapping();

  decks = [1, 2].map((channel) => new Deck(channel));

  deckIndependentControls = [
    new FineMidiControl("Crossfader", {
      onValueChanged: (value) => {
        engine.setParameter("[Master]", "crossfader", value);
      },
    }),
    new Button("LibraryBack", {
      onPressed: () => {
        activate("[Library]", "MoveFocusForward");
      },
    }),
    new Button("LibraryView", {
      onPressed: () => {
        toggleControl("[Master]", "maximize_library");
      },
    }),
  ];

  function traxControl(name: string, factor: number): MidiControl {
    return new MidiControl(name, false, {
      onNewValue: (value) => {
        const direction = value > 0x40 ? value - 0x80 : value;
        engine.setValue("[Library]", "MoveVertical", direction * factor);
      },
    });
  }
  deckIndependentControls.push(traxControl("TraxEncoder", 1));
  deckIndependentControls.push(traxControl("TraxEncoderShifted", 5));

  registerControls(deckIndependentControls);
  for (const deck of decks) {
    registerControls(deck.controls);
  }

  midi.sendShortMsg(0x9f, 0x09, 0x7f);
}

export function midiInput(channel: number, midiNo: number, value: number, status: number, group: string): void {
  //engine.log(`Channel ${channel}, MidiNo: ${midiNo}, Value: ${value}, Status: ${status}, Group: ${group}`);

  const controlName = MidiMapping.mapping[status][midiNo];
  if (controlName == null) return;
  //engine.log(`${controlName}: ${value}`);

  for (const control of controls) {
    control.offerValue(controlName, value);
  }
}

function registerControls(this: any, newControls: MidiControl[]): void {
  controls.push(...newControls);
}
