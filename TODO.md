# To Do

## Next Up

- Chording
  - Test chording lesson
  - Add chording WPM to words page (if there is any chording word)
- UseStorage better caching for words
  - Create a useWords hook that uses storage
  - Create a new advanced DBCache middleware (copy existing)
  - Convert the current DBCache to use IndexedDB instead of LocalStorage
  - Able to fetch individual words (items)
  - Able to fetch all words (items)
  - Update the cache after fetching
  - Update both FS and IndexedDB when updating the cache
- Calculate if the word was typed manually or using chords

## To Do

- Discard does not discard the changes to the lesson
- Improve caching of lessons and words
- Select keyboard layout for lesson
- Tooltip component
  - Tooltips for selectors
  - Tooltips for WPMDisplay
- Settings page
  - Advanced settings
  - Multiple keyboard layouts
  - Go back to Practice page
- Migrate to using Vite instead of CRA and Craco
- Save word history for successful exercises
- Create smart practice session of a lesson
  - Implement max exercise length
- Lesson Menu - Improvements
  - Show duplicates of words
  - Handle errors
- Undo actions
