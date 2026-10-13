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
- Task creation includes category, priority, and a time estimate.
- Monthly calendar navigation and day selection.
- Profile editing, light/dark appearance, notification preference, and local-data reset.
- Sleep scheduling/protection features are intentionally excluded.
- Manrope font from the public Expo Google Fonts package.
- Local persistence using AsyncStorage.

## Local-first privacy model

The profile setup is **not a server login**. There is no authentication backend or account creation request. The name, optional email label, tasks, timer state, and preferences are stored in AsyncStorage on the device. After the first setup, the profile screen is not shown again unless local data is reset or the app's storage is cleared.

Because there is no cloud account, data does not automatically sync to another device. Uninstalling the app may remove its local data depending on the platform.

## Notes

- The scenic hero uses a remote Unsplash image and needs an internet connection to load that image.
- This is an initial functional implementation based on the provided UI mockup. Device testing and production polish (accessibility audit, notification scheduling, app icons, and store signing) should be completed before release.
