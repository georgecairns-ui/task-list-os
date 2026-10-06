# Make it yours

Task List OS comes with a clean, neutral look and a Get AI Powers terracotta accent, but it's your workspace. The easiest way to change anything is to ask Claude, for example:

- "Make the task list use our brand colours: navy and orange."
- "Change the font to something rounder."
- "Rename 'Quick wins' to 'Small jobs'."
- "Count 10 minutes saved per task instead of 6."
- "Add a folder for stock to my files."

## What Claude changes, and where

| You want to change | Claude edits |
|---|---|
| Colours, fonts, corner roundness, spacing | `apps/shared/theme.css` (every look-and-feel setting is in this one file) |
| The Get AI Powers slab-serif headings | `apps/shared/theme.css`: follow the note at the bottom of the file |
| Your name, business name, time saved per task and per plan | The Settings button (the cog) in the app, or `settings` in your task file |
| The words on the category labels | `CATEGORIES` near the top of `apps/task-list/app/model.js` |
| The logo in the sidebar | Replace `apps/shared/images/GAIP-logo-black-teal-pop-RGB.svg` with your own SVG under the same name, or ask Claude to point the app at a new file |
| Your folders | `files/` |
| How Claude writes for you | `context/voice.md` |
| What Claude can do in your apps | `context/tools.md` |

## Notes for Claude

- Change colours only through the variables in `apps/shared/theme.css`. Keep text dark enough on the background to read easily: aim for a contrast ratio of at least 4.5 to 1 for normal text. If a brand colour is too light for buttons, use a darker shade of it for buttons and keep the original for decoration.
- Fonts must be files inside `apps/shared/fonts/` (the app works without internet). If the person wants a font you can't add as a file, use the closest system font in the font list instead and tell them.
- After any change, ask them to reload the app and check it looks right.
- Keep the old values in a comment for one change, so it's easy to go back.
