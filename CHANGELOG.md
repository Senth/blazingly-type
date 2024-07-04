# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### ➕ Added

- Top menu with profile and login/logout menu
- Logout functionality

### 🔄 Changed

- Login is done through a modal instead of /login
- Increase the WPM multiplier from 0.5 to 3 when calculating next words to practice
- Removed scope and added exercise length instead
- Moved sort by worst from scope into prioritize section
- Simplified the generation section to be called repetition

### 🐛 Fixed

- Pressing space at the start does no longer clear the current WPM

## 0.1.0 - 2024-07-03

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
