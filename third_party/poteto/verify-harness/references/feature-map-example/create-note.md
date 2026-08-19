# Create a note

Create note lets a user save a titled note from the browser or CLI and confirm the saved note from a second user-facing view.

## Sub-features

- `create-open` opens a blank editor from each browser entry point.
- `create-save` persists a title and body.
- `create-cli` creates the same note shape from the terminal.

## How to get to it (user POV)

- Choose the `New note` button in the browser toolbar.
- Press `n` in the browser while focus is outside an editable field.
- Run `notes create --title <title> --body <body>` in a terminal.

## Driving it with control-notes

Preconditions:

- Notes is healthy at `http://127.0.0.1:4173` and `control-notes doctor` reports the expected URL and disposable data directory.
- No note is titled `Release checklist`.

- **Open editor.** Choose `New note`. Run `control-notes browser click --role button --name "New note"`. A form named `Note editor` appears with focus in the `Title` textbox.
- **Enter content.** Type the title and body. Run `control-notes browser fill --role textbox --name "Title" --value "Release checklist"` and `control-notes browser fill --role textbox --name "Body" --value "Tag and publish"`. The `Save note` button becomes enabled.
- **Save note.** Choose `Save note`. Run `control-notes browser click --role button --name "Save note"`. A status named `Note saved` appears and the heading reads `Release checklist`.
- **Confirm persistence.** Return to the note list and reopen the note. Run `control-notes browser click --role link --name "All notes"` and `control-notes browser click --role link --name "Release checklist"`. The editor shows both saved values.
- **CLI entry.** Create a second note. Run `control-notes cli -- notes create --title "CLI note" --body "Created from terminal" --format json`. Exit code `0` and stdout contain the new note ID and title.
- **Proof.** Reopen both saved notes from `All notes`. Run `control-notes browser snapshot --aria --path artifacts/create-note/list.aria.txt` and `control-notes browser screenshot --path artifacts/create-note/list.png`. The artifacts show `Release checklist` and `CLI note`.

## Gotchas

- Pressing `n` while a textbox has focus types the character instead of opening a new editor.
- Titles are trimmed on save. Assert the rendered title, not the draft input value.
- A save status alone is insufficient proof. Reopen the note from the list.
- Remove `Release checklist` and `CLI note` during fixture cleanup, but retain their proof artifacts.
