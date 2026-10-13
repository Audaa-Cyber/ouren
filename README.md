# Ouren

A calm, local-first productivity app built with Expo and React Native. The interface follows the Ouren mockup: warm stone surfaces, charcoal typography, scenic imagery, generous whitespace, and the **Manrope** typeface.

## Run locally

Requirements: Node.js LTS and Expo Go (or an iOS/Android simulator).

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `a` / `i` to open an installed simulator.

## Included

- First-launch profile setup, shown once on this device.
- Home dashboard with daily task checklist and completion progress.
- Create tasks and mark tasks complete.
- Focus timer with start, pause, focus/break modes, configurable duration, and deadline-based recovery after backgrounding or restarting the app.
- Local focus session history with completed-session totals, today’s focus time, and a clear-history control.
- Optional task linking for focus sessions; completed focus history stores the task title even if the task is later edited or removed.
- A local progress screen with today’s focus time, seven-day focus chart, task completion rate, and most-focused linked task.
- Task creation includes category, priority, a time estimate, and an optional daily schedule time.
- Task filters for open, scheduled, and completed tasks.
- Daily and weekly recurring tasks that reopen after their recurrence period when the app is opened.
- Confirmed task deletion without deleting completed focus-history records.
- Editable tasks, including title, category, priority, estimate, schedule and recurrence.
- Custom focus and break durations, plus scheduled local notifications when a timer ends; disabling notifications cancels pending focus alerts.
- Export and restore preserve configured focus and break durations.
- Export focus history as a CSV spreadsheet with completion time, mode, linked task and duration.
- Progress milestones for first focus session, focus across three days, one hour of focus, and five completed tasks.
- Task rows show due dates and recurrence labels.
- A dedicated Overdue filter separates missed deadlines from tasks due today, with overdue labels and a live count.
- Progress totals and weekly charts count focus sessions only, with a comparison against the previous seven-day period.
- Daily recurring tasks reset when the local calendar day changes; weekly tasks reset at the local Monday week boundary.
- Daily focus goals with progress feedback and a consecutive-day focus streak.
- Due dates on tasks, with date-aware Today/Upcoming filters and calendar-day task lists.
- Task search across titles, details, categories, priorities, due dates and recurrence.
- Active task lists prioritize overdue and high-priority work; completed tasks are ordered by most recent completion.
- After a linked focus session, an optional prompt lets the user mark that task complete without completing it automatically.
- Local JSON backup export and validated backup restore, including tasks, preferences, timer state and focus history.
- Monthly calendar navigation and day selection.
- Profile editing, light/dark appearance, notification preference, and local-data reset.
- Sleep scheduling/protection features are intentionally excluded.
- Manrope font from the public Expo Google Fonts package.
- Local persistence using AsyncStorage.

## Automated validation

GitHub Actions runs `npx expo-doctor` and `npx expo export --platform android` on pushes to `main`, pull requests targeting `main`, and manual dispatches. A green workflow run is required before treating the Android bundle as verified.

## Local-first privacy model

The profile setup is **not a server login**. There is no authentication backend or account creation request. The name, optional email label, tasks, timer state, and preferences are stored in AsyncStorage on the device. After the first setup, the profile screen is not shown again unless local data is reset or the app's storage is cleared.

Because there is no cloud account, data does not automatically sync to another device. Uninstalling the app may remove its local data depending on the platform.

## Notes

- The scenic hero uses a remote Unsplash image and needs an internet connection to load that image.
- This is an initial functional implementation based on the provided UI mockup. Device testing and production polish (accessibility audit, notification scheduling, app icons, and store signing) should be completed before release.
