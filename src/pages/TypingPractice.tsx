import Radio from "@components/basic/radio"
import { useWords } from "@db/word"
import { Word } from "@models/word"
import useExerciseStore, { PreviousExercise, PreviousWord } from "@stores/exercise"
import useWpmCounterStore from "@stores/wpmCounter"
import useSettingsStore from "@stores/settings"
import React, { useEffect, useRef, useState } from "react"
import { LessonMenu, LessonMenuClosed } from "@components/LessonMenu"
import TopBar from "@components/TopBar"
import Checkbox from "@components/basic/checkbox"
import { OrderTypes, Target, Targets } from "@models/exercise"
import useTimerStore from "@stores/timer"

enum Sizes {
  medium = 900,
  large = 99999,
}

export default function TypingPracticePage(): JSX.Element {
  const divRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<Sizes>(Sizes.large)

  useEffect(() => {
    const div = divRef.current
    if (!div) {
      return
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width } = entry.contentRect
        if (width < Sizes.medium) {
          setSize(Sizes.medium)
        } else {
          setSize(Sizes.large)
        }
      }
    })

    resizeObserver.observe(div)

    return () => resizeObserver.unobserve(div)
  }, [divRef])

  return (
    <div className="h-full w-full flex flex-col">
      <TopBar menu={<LessonMenuClosed />} />
      <div className="h-full w-full flex">
        <LessonMenu />
        <div className="grow"></div>
        <div ref={divRef} className="h-full min-w-[400px] max-w-[968px] flex flex-col flex-grow p-5">
          <Selectors size={size} />
          <ExerciseWrapper />
          <WPMDisplay />
        </div>
        <div className="grow"></div>
      </div>
    </div>
  )
}

function Selectors({ size }: { size: Sizes }): JSX.Element {
  let columns = "grid-cols-4"
  switch (size) {
    case Sizes.medium:
      columns = "grid-cols-2"
      break
    default:
      columns = "grid-cols-4"
  }

  return (
    <div className={`w-full grid ${columns} gap-4`}>
      <PrioritySelector />
      <LengthSelector />
      <RepetitionSelector />
      <TargetSelector />
    </div>
  )
}

function PrioritySelector(): JSX.Element {
  const { generation, setGeneration } = useExerciseStore()

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl mb-4">Prioritize</h2>
      <div className="flex flex-col">
        {Object.values(OrderTypes).map((order) => (
          <Radio
            name="order"
            key={order}
            label={order}
            checked={order === generation.order}
            onChecked={() => setGeneration({ ...generation, order: order })}
          />
        ))}
      </div>
    </div>
  )
}

function LengthSelector(): JSX.Element {
  const { generation, setGeneration, maxTime, setMaxTime } = useExerciseStore()

  function handleExerciseCountChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = parseInt(event.target.value)
    if (isNaN(value) || value <= 0) {
      return
    }

    setGeneration({ ...generation, maxExercises: value })
  }

  function handleTimeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = parseInt(event.target.value)
    if (isNaN(value) || value <= 0) {
      return
    }

    setMaxTime({ minutes: value, enabled: true })
  }

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl mb-4">Exercise Length</h2>
      <div className="flex flex-col gap-2">
        <Checkbox
          label="exercise-count"
          checked={generation.maxExercisesEnabled}
          onChecked={(checked) => setGeneration({ ...generation, maxExercisesEnabled: checked })}
        >
          Max
          <input
            className="w-12 text-black px-1 py-0.5 mx-2"
            type="number"
            step={5}
            value={generation.maxExercises}
            onChange={handleExerciseCountChange}
          />
          exercises.
        </Checkbox>

        <div className="text-gray-400">
          <Checkbox
            label="Time"
            checked={maxTime.enabled}
            disabled={true}
            onChecked={(checked) => setMaxTime({ ...maxTime, enabled: checked })}
          >
            Max
            <input
              className="w-12 text-black px-1 py-0.5 mx-2"
              type="number"
              disabled={true}
              value={maxTime.minutes}
              onChange={handleTimeChange}
            />
            minutes.
          </Checkbox>
        </div>
      </div>
    </div>
  )
}

function RepetitionSelector(): JSX.Element {
  const { generation, setGeneration } = useExerciseStore()

  function handleCombinationChange(event: React.ChangeEvent<HTMLInputElement>) {
    // Validate input to a number
    const value = parseInt(event.target.value)
    if (isNaN(value) || value <= 0) {
      return
    }

    setGeneration({ ...generation, combinations: value })
  }

  function handleRepetitionChange(event: React.ChangeEvent<HTMLInputElement>) {
    // Validate input to a number
    const value = parseInt(event.target.value)
    if (isNaN(value) || value <= 0) {
      return
    }

    setGeneration({ ...generation, repetitions: value })
  }

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl mb-4">Repetition</h2>
      <div className="flex flex-col gap-2">
        <div>
          <input
            className="w-8 mx-2 text-black px-1 py-0.5"
            type="number"
            value={generation.combinations}
            onChange={(e) => handleCombinationChange(e)}
          />
          words repeated
        </div>
        <div>
          <input
            className="w-8 mx-2 text-black px-1 py-0.5"
            type="number"
            value={generation.repetitions}
            onChange={(e) => handleRepetitionChange(e)}
          />
          times.
        </div>
      </div>
    </div>
  )
}

function TargetSelector(): JSX.Element {
  const { target, setTarget } = useExerciseStore()

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl mb-4">Target</h2>
      <div className="flex flex-col gap-2">
        <Radio
          name="target"
          label="Percentage"
          checked={target.selected === Targets.Percentage}
          onChecked={() => setTarget({ ...target, selected: Targets.Percentage })}
        >
          Percentage
          <input
            className="w-12 text-black px-1 py-0.5 mx-2"
            type="number"
            value={target.percentage || 0}
            onChange={(e) =>
              setTarget({
                ...target,
                selected: Targets.Percentage,
                percentage: parseInt(e.target.value),
              })
            }
          />
          %.
        </Radio>
        <Radio
          name="target"
          label="Fixed"
          checked={target.selected === Targets.Relative}
          onChecked={() => setTarget({ ...target, selected: Targets.Relative })}
        >
          Relative
          <input
            className="w-12 text-black px-1 py-0.5 mx-2"
            type="number"
            value={target.relative || 0}
            onChange={(e) =>
              setTarget({
                ...target,
                selected: Targets.Relative,
                relative: parseInt(e.target.value),
              })
            }
          />
          WPM.
        </Radio>
      </div>
    </div>
  )
}

function ExerciseWrapper(): JSX.Element {
  return (
    <div className="mt-16 w-full m-auto">
      <ExerciseProgress />
      <ExerciseWords />
      <TypingField />
    </div>
  )
}

function ExerciseProgress(): JSX.Element {
  const [currentExerciseIndex, completed] = useExerciseStore((state) => [state.currentExerciseIndex, state.completed])
  const allExercises = useExerciseStore((state) => state.allExercises)
  const progress = `${currentExerciseIndex + 1}/${allExercises.length}`

  let className = "text-center text-2xl"
  if (completed) {
    className += " text-green-500"
  }

  return (
    <div className={className}>
      Exercise {progress} {completed && "(completed)"}
    </div>
  )
}

function ExerciseWords(): JSX.Element {
  const correctInput = useCorrectInput()

  return <div className="mt-10 min-h-16 bg-sky-800 p-3 text-4xl text-center whitespace-pre-wrap">{correctInput}</div>
}

function useCorrectInput(): string {
  const { getCurrentWords, lesson } = useExerciseStore()
  const currentWords = getCurrentWords()

  if (!currentWords) {
    return ""
  }

  if (!lesson?.settings?.keepSpaces) {
    return currentWords.join(" ")
  }

  let correctInput = ""
  for (let i = 0; i < currentWords.length; i++) {
    if (i !== 0 && !currentWords[i - 1].endsWith(" ") && !currentWords[i].startsWith(" ")) {
      correctInput += " "
    }
    correctInput += currentWords[i]
  }

  return correctInput
}

function TypingField(): JSX.Element {
  const [input, setInput] = React.useState<string>("")
  const [hadError, setHadError] = React.useState<boolean>(false)
  const { getCurrentWords, nextExercise, setPreviousExercise, getUniqueWords, target, lesson } = useExerciseStore()
  const wpmCounter = useWpmCounterStore()
  const currentWords = getCurrentWords() || []
  const uniqueWords = getUniqueWords()
  const wordsResponse = useWords(uniqueWords)
  const correctInput = useCorrectInput()
  const timeout = useSettingsStore((state) => state.exercise.autoSkipTime)
  const timer = useTimerStore()
  const targetWpms = wordsResponse.data
    ? wordsResponse.data.map((word) => {
        const highestWpm = Word.getHighestWpm(word, lesson.settings?.chorded)
        return calculateTargetWpm(target, highestWpm).toFixed(1)
      })
    : Array.from({ length: uniqueWords.length }, () => "0.0")

  interface BestAttempt {
    totalDiff: number
    bestAttempt: string[]
  }
  const [bestAttempt, setBestAttempt] = useState<BestAttempt>({
    totalDiff: Number.MAX_SAFE_INTEGER,
    bestAttempt: Array.from({ length: uniqueWords.length }, () => ""),
  })

  if (timeout <= timer.getElapsedTime()) {
    setPreviousExercise({
      metTarget: false,
      elapsedTime: timer.getElapsedTime(),
      words: uniqueWords.map((word, i) => ({
        word: word,
        wpm: bestAttempt.bestAttempt[i],
        targetWpm: targetWpms[i],
        isHighscore: false,
      })),
    })
    nextExercise()
    setInput("")
    setHadError(false)
  }

  useEffect(() => {
    if (wpmCounter.exercise !== correctInput) {
      wpmCounter.setExercise(correctInput, uniqueWords)
    }
  }, [correctInput, wpmCounter, uniqueWords])

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape" || event.key === "Tab") {
      setHadError(false)
      setInput("")
      event.preventDefault()
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value

    // Sometimes we want to ignore space if it's the first character and it's not part of the "word"
    if (value.length === 1 && value === " " && correctInput[0] !== " ") {
      return
    }

    // Update WPM counter
    const isWrong = correctInput.substring(0, value.length) !== value
    if (!isWrong && value.length > input.length) {
      wpmCounter.updateCharTime(value.length - 1)
    }

    // Update the timer
    timer.keyPressed()

    if (value === correctInput) {
      setInput("")

      if (hadError) {
        setHadError(false)
        return
      }

      // Not the full exercise
      if (wordsResponse?.data?.length !== uniqueWords.length) {
        return
      }

      // Check if the target WPM for each word was met
      const wordWpms: number[] = []
      const diffWpms: number[] = []
      let metTarget = true
      for (let i = 0; i < uniqueWords.length; i++) {
        const word = currentWords[i]
        const wpm = wpmCounter.getWordWpm(word, lesson.settings?.chorded)

        const diffWpm = parseFloat(targetWpms[i]) - parseFloat(wpm.toFixed(1))
        if (diffWpm > 0) {
          metTarget = false
        }

        wordWpms.push(wpm)
        diffWpms.push(diffWpm)
      }

      // Save the best attempt
      if (!metTarget) {
        let totalDiff = 0
        diffWpms.forEach((diff) => {
          if (diff > 0) {
            totalDiff += diff
          }
        })

        if (totalDiff < bestAttempt.totalDiff) {
          setBestAttempt({
            totalDiff,
            bestAttempt: wordWpms.map((wpm) => wpm.toFixed(1)),
          })
        }

        return
      }

      // Save the previous exercise
      const previousWords: PreviousWord[] = []

      // Update and save the words to DB
      const words = wordsResponse.data
      for (let i = 0; i < uniqueWords.length; i++) {
        previousWords.push({
          word: currentWords[i],
          wpm: wordWpms[i].toFixed(1),
          targetWpm: targetWpms[i],
          isHighscore: wordWpms[i] > Word.getHighestWpm(words[i], lesson.settings?.chorded),
        })
        if (lesson.settings?.chorded) {
          words[i] = Word.updateChordWpm(words[i], wordWpms[i])
        } else {
          words[i] = Word.updateWpm(words[i], wordWpms[i])
        }
      }
      const previousExercise: PreviousExercise = {
        words: previousWords,
        elapsedTime: timer.getElapsedTime(),
        metTarget: true,
      }

      nextExercise()
      setPreviousExercise(previousExercise)
      wordsResponse.mutate(words)
    } else {
      if (value.length === 0) {
        setHadError(false)
      }
      setInput(value)
    }
  }

  const isWrong = correctInput.substring(0, input.length) !== input
  if (isWrong && !hadError) {
    setHadError(true)
  }

  return (
    <div className="mt-10">
      <input
        className={`p-3 h-16 w-full placeholder:bottom-2 placeholder:relative placeholder:text-lg text-center text-4xl text-black rounded-lg ${isWrong && "bg-red-200"}`}
        type="text"
        autoCorrect="off"
        autoCapitalize="none"
        placeholder="Re-type if failed, press <TAB> or <ESC> to reset"
        spellCheck="false"
        value={input}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
      />
    </div>
  )
}

function WPMDisplay(): JSX.Element {
  const wpmCounter = useWpmCounterStore()
  const { getUniqueWords, previousExercise, target, lesson } = useExerciseStore()
  const uniqueWords = getUniqueWords()
  const wordsResponse = useWords(uniqueWords)
  const timer = useTimerStore()

  // Create the rows for the table
  interface Column {
    text: string
    className?: string
    style?: string
  }

  const maxRows = Math.max(previousExercise.words.length, uniqueWords.length)
  const rows: Column[][] = Array.from({ length: maxRows }, () => Array.from({ length: 6 }, () => ({ text: "" })))

  // Previous words
  for (let i = 0; i < previousExercise.words.length; i++) {
    const word = previousExercise.words[i]
    const wpm = word.isHighscore ? `${word.wpm} 🏆` : word.wpm
    rows[i][0] = { text: word.word, className: "text-gray-400" }
    rows[i][1] = { text: wpm, className: "text-gray-400" }
    rows[i][2] = { text: word.targetWpm, className: "text-gray-400" }
  }

  // Current
  for (let i = 0; i < uniqueWords.length; i++) {
    const word = uniqueWords[i]
    const wordColumn: Column = { text: word }
    const wpmColumn: Column = { text: "" }
    const targetColumn: Column = { text: "0.0" }

    if (!wordsResponse?.isLoading && wordsResponse?.data?.length === uniqueWords.length) {
      const highestWpm = Word.getHighestWpm(wordsResponse.data[i], lesson.settings?.chorded)
      targetColumn.text = calculateTargetWpm(target, highestWpm).toFixed(1)
    }

    // Calculate color based on how far from the target WPM the user is
    // 0 WPM = white
    // Above target = green
    // 0-20 WPM below target = gradient from yellow to red
    // Below 20 WPM = red
    const wpm = wpmCounter.getWordWpm(word, lesson.settings?.chorded)
    wpmColumn.text = wpm.toFixed(1)
    if (wpm === 0) {
      wpmColumn.className = "text-white"
    } else if (wpm >= parseFloat(targetColumn.text)) {
      wpmColumn.className = "text-green-500"
    } else {
      const diff = parseFloat(targetColumn.text) - wpm
      if (diff <= 30) {
        const red = 255
        const green = (255 - (diff / 30) * 255).toFixed(0)
        wpmColumn.style = `rgb(${red},${green},0)`
      } else {
        wpmColumn.className = "text-red-500"
      }
    }

    rows[i][3] = wordColumn
    rows[i][4] = wpmColumn
    rows[i][5] = targetColumn
  }

  return (
    <>
      <table className="text-2xl text-left mt-16 w-full m-auto table-fixed">
        <thead>
          <tr className="text-3xl font-normal">
            <th className="text-gray-400 pb-4" colSpan={2}>
              Previous
            </th>
            <th className="text-gray-400 pb-4 text-2xl">{previousExercise.elapsedTime}</th>
            <th className="pb-4" colSpan={2}>
              Current
            </th>
            <th className="text-gray-400 pb-4 text-2xl">{timer.getElapsedTime()}</th>
          </tr>
          <tr className="border-b border-slate-500">
            <th className="w-1/6 text-gray-400 text-lg">Word</th>
            <th className="w-1/6 text-gray-400 text-lg">WPM </th>
            <th className="w-1/6 text-gray-400 text-lg">Target</th>
            <th className="w-1/6 text-lg">Word</th>
            <th className="w-1/6 text-lg">WPM </th>
            <th className="w-1/6 text-lg">Target</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((column, j) => (
                <td key={j} className={`text-2xl ${column.className}`} style={{ color: column.style }}>
                  {column.text}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex-grow"></div>
      <div className="mb-10 text-4xl w-full flex gap-4 justify-center text-gray-400">
        <span>{wpmCounter.getWpm().toFixed(0)} WPM</span>
        <span> | </span>
        <span>{timer.getTotalElapsedTime()}</span>
      </div>
    </>
  )
}

function calculateTargetWpm(target: Target, highestWpm?: number): number {
  if (!highestWpm) {
    return 1
  }

  switch (target.selected) {
    case Targets.Percentage:
      return (highestWpm * target.percentage!) / 100
    case Targets.Relative:
      return highestWpm + target.relative!
    default:
      return highestWpm
  }
}
