# Changelog

All notable changes to this project will be documented in this file.

## 2024-07-06 - 2024-07-31

### ➕ Added

- Target WPM can now be set to either percentage or relative to the highest WPM (used to be 100%)
- Time spent on current exercise now automatically pauses after 5 seconds of inactivity
- ✨ is now added after previous WPM when a new high score has been reached

### 🔄 Changed

- Improve calculation of WPM when words that begin or end with spaces are in the exercise
- Save exercise progress locally instead of in the cloud

### 🐛 Fixed

- Word WPM now only uses the first decimal when checking if reached target WPM. Previously there was a chance
  that the WPM was 0.01 off the target WPM, so it would display as green but was not met.
- Now saves the progress when automatically skipping the exercise
- All previous words are now shown even when reducing the word count in repetition

### 💻 Technical

- Add linting checks for the PRs

## 2024-07-05

### ➕ Added

- Top menu with profile and login/logout menu
- Logout functionality
- Advanced settings for lessons
  - Add custom delimiter for words. Allows you to add words with spaces.
  - Keep spaces will not trim spaces at the end of the word (useful for practicing code)

### 🔄 Changed

- Login is done through a modal instead of /login
- Increase the WPM multiplier from 0.5 to 3 when calculating next words to practice
- Removed scope and added exercise length instead
- Moved sort by worst from scope into prioritize section
- Simplified the generation section to be called repetition

### 🐛 Fixed

- Pressing space at the start does no longer clear the current WPM
- Couldn't create a new lesson as it was treated as a built-in lesson

## 2024-07-03

### ➕ Added

- Add default bigrams
- Login using a Google Account.
- Add default trigrams, quadgrams, and most common words
- Highlight errors in the practice session
- Calculate WPM and average word WPM
- Save the average word WPM in the cloud to automatically adjust the target WPM and sort by worst words.
- Show target word WPM for current exercise
- Exercise progress is saved in the cloud
- Implement scope to sort by the words that need more practice
- Show time spent on the current exercise
- Skip exercise when spent more than 3 minutes
- You can now access it from blazingly-type.com
- Create custom lessons with the ability to copy an existing one
