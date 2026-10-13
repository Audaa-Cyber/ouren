import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, ImageBackground, KeyboardAvoidingView, Modal, Platform,
  Pressable, ScrollView, StatusBar, StyleSheet, Switch, Text, TextInput, View
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';

const STORE_KEY = 'ouren.local.v1';
const INK = '#24231F';
const PAPER = '#F4F0E9';
const MUTED = '#89857D';
const LINE = '#E4DED4';
const LANDSCAPE = 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1200&q=85';

const initialTasks = [
  { id: '1', title: 'Deep work session', detail: '2h · Focus', done: false, category: 'Focus' },
  { id: '2', title: 'Read 20 pages', detail: '30m · Growth', done: false, category: 'Growth' },
  { id: '3', title: 'Workout', detail: '1h · Health', done: false, category: 'Health' },
  { id: '4', title: 'Plan tomorrow', detail: '15m · Planning', done: false, category: 'Planning' },
];

function Mark({ size = 28, color = INK }) {
  return <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: size * .82, height: size * .82, borderWidth: size * .16, borderColor: color, borderRadius: size * .25, transform: [{ rotate: '30deg' }], alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: size * .28, height: size * .28, backgroundColor: color, transform: [{ rotate: '-30deg' }], borderRadius: 2 }} />
    </View>
  </View>;
}
function Brand({ dark = false, small = false }) {
  const color = dark ? PAPER : INK;
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
    <Mark size={small ? 21 : 27} color={color} />
    <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: small ? 16 : 20, letterSpacing: 2.5, color }}>ouren</Text>
  </View>;
}
function Label({ children, dark = false, style }) {
  return <Text style={[{ fontFamily: 'Manrope_700Bold', color: dark ? PAPER : INK, fontSize: 13 }, style]}>{children}</Text>;
}
function Button({ title, onPress, light = false, icon, style }) {
  return <Pressable onPress={onPress} style={[styles.button, { backgroundColor: light ? PAPER : INK }, style]}>
    <Text style={[styles.buttonText, { color: light ? INK : '#FFFDF9' }]}>{title}</Text>
    {icon && <Ionicons name={icon} size={17} color={light ? INK : '#FFFDF9'} />}
  </Pressable>;
}
function TaskRow({ task, onToggle, dark = false }) {
  return <Pressable onPress={onToggle} style={[styles.taskRow, { borderBottomColor: dark ? '#3A3934' : LINE }]}>
    <View style={[styles.check, task.done && { backgroundColor: dark ? PAPER : INK, borderColor: dark ? PAPER : INK }]}>
      {task.done && <Ionicons name="checkmark" size={14} color={dark ? INK : '#FFF'} />}
    </View>
    <View style={{ flex: 1 }}>
      <Text style={[styles.taskTitle, { color: dark ? PAPER : INK }, task.done && styles.struck]}>{task.title}</Text>
      <Text style={[styles.taskDetail, { color: dark ? '#A7A198' : MUTED }]}>{task.detail}</Text>
    </View>
    <Ionicons name="ellipsis-horizontal" size={17} color={dark ? '#A7A198' : '#A39D93'} />
  </Pressable>;
}

export default function App() {
  const [fontsLoaded] = useFonts({ Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold });
  const [hydrated, setHydrated] = useState(false);
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState('Home');
  const [tasks, setTasks] = useState(initialTasks);
  const [dark, setDark] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [focusLength, setFocusLength] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [focusMode, setFocusMode] = useState('Focus');
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [modal, setModal] = useState(false);
  const [draftTask, setDraftTask] = useState('');
  const [draftCategory, setDraftCategory] = useState('Focus');
  const [profileModal, setProfileModal] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftEmail, setDraftEmail] = useState('');
  const [intro, setIntro] = useState(0);
  const tick = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORE_KEY);
        if (raw) {
          const data = JSON.parse(raw);
          setProfile(data.profile || null);
          setTasks(Array.isArray(data.tasks) ? data.tasks : initialTasks);
          setDark(!!data.dark);
          setNotifications(data.notifications !== false);
          setFocusLength(data.focusLength || 25);
          setSecondsLeft(data.secondsLeft ?? (data.focusLength || 25) * 60);
        }
      } catch (e) { console.warn('Could not restore Ouren data', e); }
      finally { setHydrated(true); }
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORE_KEY, JSON.stringify({ profile, tasks, dark, notifications, focusLength, secondsLeft }))
      .catch(e => console.warn('Could not save Ouren data', e));
  }, [hydrated, profile, tasks, dark, notifications, focusLength, secondsLeft]);

  useEffect(() => {
    if (running) {
      tick.current = setInterval(() => setSecondsLeft(s => {
        if (s <= 1) { clearInterval(tick.current); setRunning(false); Alert.alert('Session complete', 'A little progress goes a long way. Take a mindful break.'); return 0; }
        return s - 1;
      }), 1000);
    } else if (tick.current) clearInterval(tick.current);
    return () => { if (tick.current) clearInterval(tick.current); };
  }, [running]);

  const palette = dark ? { bg: '#24231F', card: '#302F2A', text: PAPER, muted: '#AAA49A', line: '#414039', soft: '#38372F' } :
    { bg: PAPER, card: '#FFFCF7', text: INK, muted: MUTED, line: LINE, soft: '#EAE4DA' };
  const now = new Date();
  const shownMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const monthName = shownMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const calendarCells = useMemo(() => {
    const start = new Date(shownMonth.getFullYear(), shownMonth.getMonth(), 1).getDay();
    const count = new Date(shownMonth.getFullYear(), shownMonth.getMonth() + 1, 0).getDate();
    return [...Array(start).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)];
  }, [monthOffset, hydrated]);
  const completed = tasks.filter(t => t.done).length;
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const fmt = n => String(Math.floor(n)).padStart(2, '0');
  const clock = `${fmt(secondsLeft / 60)}:${fmt(secondsLeft % 60)}`;

  const addTask = () => {
    if (!draftTask.trim()) return;
    setTasks(prev => [{ id: String(Date.now()), title: draftTask.trim(), detail: `30m · ${draftCategory}`, done: false, category: draftCategory }, ...prev]);
    setDraftTask(''); setModal(false); setTab('Tasks');
  };
  const toggleTask = id => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const finishSetup = () => {
    if (!draftName.trim()) { Alert.alert('Your name', 'Add a name to personalize your space.'); return; }
    setProfile({ name: draftName.trim(), email: draftEmail.trim() }); setIntro(0); setTab('Home');
  };
  const resetTimer = () => { setRunning(false); setSecondsLeft(focusLength * 60); };

  if (!fontsLoaded || !hydrated) return <View style={{ flex: 1, backgroundColor: PAPER, alignItems: 'center', justifyContent: 'center' }}><Mark size={54} /><Text style={{ marginTop: 18, fontFamily: 'Manrope_600SemiBold', letterSpacing: 3, color: INK }}>ouren</Text><ActivityIndicator style={{ marginTop: 20 }} color={INK} /></View>;

  if (!profile) return <View style={{ flex: 1, backgroundColor: PAPER }}>
    <StatusBar barStyle="dark-content" />
    <ImageBackground source={{ uri: LANDSCAPE }} resizeMode="cover" style={{ flex: 1 }} imageStyle={{ opacity: .78 }}>
      <LinearGradient colors={['rgba(244,240,233,.25)', 'rgba(244,240,233,.45)', PAPER]} style={{ flex: 1, padding: 28, paddingTop: 68, justifyContent: 'space-between' }}>
        <Brand />
        <View>
          <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 36, lineHeight: 45, color: INK, letterSpacing: -1.5, marginBottom: 14 }}>A calmer mind{ '\n' }builds a bigger{ '\n' }future.</Text>
          <Text style={{ color: '#625F58', fontFamily: 'Manrope_400Regular', fontSize: 14, lineHeight: 22, maxWidth: 290 }}>A little space to focus, plan, and make real progress — one day at a time.</Text>
          <View style={{ marginTop: 30, padding: 22, borderRadius: 25, backgroundColor: 'rgba(255,252,247,.88)' }}>
            <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 21, color: INK, marginBottom: 6 }}>Make it yours.</Text>
            <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 12, color: MUTED, lineHeight: 18, marginBottom: 18 }}>Your profile and progress stay on this device. No account is sent to a server.</Text>
            <TextInput value={draftName} onChangeText={setDraftName} placeholder="Your name" placeholderTextColor="#A6A096" style={styles.field} returnKeyType="next" />
            <TextInput value={draftEmail} onChangeText={setDraftEmail} placeholder="Email (optional)" placeholderTextColor="#A6A096" keyboardType="email-address" autoCapitalize="none" style={styles.field} />
            <Button title="Get started" icon="arrow-forward" onPress={finishSetup} style={{ marginTop: 5 }} />
          </View>
          <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 10, color: '#777168', textAlign: 'center', marginTop: 14 }}>ONE SMALL STEP AT A TIME</Text>
        </View>
      </LinearGradient>
    </ImageBackground>
  </View>;

  const navItems = [
    { key: 'Home', icon: 'home-outline', active: 'home' },
    { key: 'Tasks', icon: 'checkbox-outline', active: 'checkbox' },
    { key: 'Focus', icon: 'timer-outline', active: 'timer' },
    { key: 'Calendar', icon: 'calendar-outline', active: 'calendar' },
  ];

  const renderHome = () => <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.page}>
    <View style={styles.topline}><Brand small /><Pressable onPress={() => setTab('Settings')} style={styles.avatar}><Text style={styles.avatarText}>{profile.name.slice(0,1).toUpperCase()}</Text></Pressable></View>
    <ImageBackground source={{ uri: LANDSCAPE }} imageStyle={{ borderRadius: 27, opacity: dark ? .45 : .82 }} style={[styles.hero, { backgroundColor: dark ? '#39382F' : '#D5CABC' }]}>
      <LinearGradient colors={dark ? ['rgba(20,20,18,.25)','rgba(20,20,18,.85)'] : ['rgba(30,28,24,.02)','rgba(30,28,24,.76)']} style={styles.heroGradient}>
        <Text style={{ fontFamily: 'Manrope_400Regular', color: '#FFFDF8', fontSize: 25, lineHeight: 33, letterSpacing: -.8 }}>{greeting},{'\n'}{profile.name}.</Text>
        <Text style={{ fontFamily: 'Manrope_400Regular', color: '#F2EEE6', fontSize: 12, lineHeight: 19, marginTop: 10, maxWidth: 210 }}>Your focus creates{ '\n' }your future.</Text>
      </LinearGradient>
    </ImageBackground>
    <View style={styles.sectionHeader}><Label>Today</Label><Text style={{ color: palette.muted, fontFamily: 'Manrope_500Medium', fontSize: 11 }}>{now.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</Text></View>
    <View style={[styles.panel, { backgroundColor: palette.card }]}>
      {tasks.slice(0,4).map(task => <TaskRow key={task.id} task={task} onToggle={() => toggleTask(task.id)} dark={dark} />)}
      <Pressable onPress={() => setTab('Tasks')} style={styles.viewAll}><Text style={{ color: palette.muted, fontFamily: 'Manrope_600SemiBold', fontSize: 12 }}>View all tasks</Text><Ionicons name="arrow-forward" size={15} color={palette.muted} /></Pressable>
    </View>
    <View style={[styles.progressCard, { backgroundColor: dark ? '#39382F' : '#E7E0D5' }]}>
      <View style={{ flex: 1 }}><Text style={{ color: palette.muted, fontFamily: 'Manrope_600SemiBold', fontSize: 11 }}>YOUR DAILY RHYTHM</Text><Text style={{ color: palette.text, fontFamily: 'Manrope_700Bold', fontSize: 19, marginTop: 6 }}>{completed} of {tasks.length} complete</Text><Text style={{ color: palette.muted, fontFamily: 'Manrope_400Regular', fontSize: 11, marginTop: 4 }}>Progress, not perfection.</Text></View>
      <View style={styles.progressRing}><Text style={{ color: palette.text, fontFamily: 'Manrope_700Bold', fontSize: 18 }}>{tasks.length ? Math.round(completed/tasks.length*100) : 0}%</Text></View>
    </View>
    <Button title="Begin a focus session" icon="arrow-forward" onPress={() => setTab('Focus')} style={{ marginTop: 22 }} />
  </ScrollView>;

  const renderTasks = () => <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.page}>
    <View style={styles.topline}><Brand small /><Pressable onPress={() => setModal(true)} style={styles.roundButton}><Ionicons name="add" size={22} color={palette.text} /></Pressable></View>
    <Text style={[styles.pageTitle, { color: palette.text }]}>Tasks</Text><Text style={[styles.subtitle, { color: palette.muted }]}>A little progress, every day.</Text>
    <View style={styles.pills}><View style={[styles.pill, { backgroundColor: palette.card }]}><Text style={{ color: palette.text, fontFamily: 'Manrope_600SemiBold', fontSize: 12 }}>All {tasks.length}</Text></View><View style={[styles.pill, { backgroundColor: palette.card }]}><Text style={{ color: palette.muted, fontFamily: 'Manrope_500Medium', fontSize: 12 }}>Today</Text></View><View style={[styles.pill, { backgroundColor: palette.card }]}><Text style={{ color: palette.muted, fontFamily: 'Manrope_500Medium', fontSize: 12 }}>Completed {completed}</Text></View></View>
    <View style={[styles.panel, { backgroundColor: palette.card, marginTop: 16 }]}>{tasks.map(task => <TaskRow key={task.id} task={task} onToggle={() => toggleTask(task.id)} dark={dark} />)}
      {!tasks.length && <Text style={{ color: palette.muted, padding: 24, textAlign: 'center', fontFamily: 'Manrope_400Regular' }}>A fresh page. Add your first task.</Text>}
    </View>
    <Pressable onPress={() => setModal(true)} style={[styles.addTask, { borderColor: palette.line }]}><Ionicons name="add-circle-outline" size={21} color={palette.muted} /><Text style={{ color: palette.muted, fontFamily: 'Manrope_600SemiBold', fontSize: 13 }}>Add a task</Text></Pressable>
  </ScrollView>;

  const renderFocus = () => <ScrollView contentContainerStyle={[styles.page, { flexGrow: 1 }]} showsVerticalScrollIndicator={false}>
    <View style={styles.topline}><Brand small /><Pressable onPress={() => setTab('Settings')}><Ionicons name="settings-outline" size={21} color={palette.muted} /></Pressable></View>
    <Text style={[styles.pageTitle, { color: palette.text, marginTop: 34 }]}>Make room to focus.</Text><Text style={[styles.subtitle, { color: palette.muted }]}>One thing at a time.</Text>
    <View style={[styles.timerCard, { backgroundColor: dark ? '#302F2A' : '#E7E0D5' }]}>
      <View style={styles.modePills}>{['Break','Focus','Music'].map(mode => <Pressable key={mode} onPress={() => { setFocusMode(mode); if (mode !== 'Music') { setRunning(false); const len = mode === 'Break' ? 5 : 25; setFocusLength(len); setSecondsLeft(len*60); } }} style={[styles.modePill, focusMode === mode && { backgroundColor: dark ? '#555249' : '#D4CCBF' }]}><Ionicons name={mode==='Break'?'cafe-outline':mode==='Focus'?'radio-button-on-outline':'musical-notes-outline'} size={15} color={palette.text} /><Text style={{ color: palette.text, fontFamily: 'Manrope_600SemiBold', fontSize: 11 }}>{mode}</Text></Pressable>)}</View>
      <View style={[styles.timerCircle, { borderColor: dark ? '#615E55' : '#C9C0B4' }]}><Text style={{ color: palette.muted, fontFamily: 'Manrope_600SemiBold', fontSize: 12, letterSpacing: 1 }}>{focusMode.toUpperCase()}</Text><Text style={{ color: palette.text, fontFamily: 'Manrope_500Medium', fontSize: 48, letterSpacing: -2, marginVertical: 8 }}>{clock}</Text><Text style={{ color: palette.muted, fontFamily: 'Manrope_400Regular', fontSize: 12 }}>{running ? 'Stay in the moment' : 'Ready when you are'}</Text></View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 18, marginTop: 26 }}>
        <Pressable onPress={resetTimer} style={[styles.timerAction, { backgroundColor: dark ? '#444239' : '#D8D0C4' }]}><Ionicons name="refresh" size={18} color={palette.text} /></Pressable>
        <Pressable onPress={() => { if (secondsLeft === 0) setSecondsLeft(focusLength*60); setRunning(v => !v); }} style={[styles.playButton, { backgroundColor: dark ? PAPER : INK }]}><Ionicons name={running ? 'pause' : 'play'} size={22} color={dark ? INK : '#FFF'} /></Pressable>
        <Pressable onPress={() => { setRunning(false); setFocusLength(25); setSecondsLeft(25*60); setFocusMode('Focus'); }} style={[styles.timerAction, { backgroundColor: dark ? '#444239' : '#D8D0C4' }]}><Ionicons name="stop-outline" size={18} color={palette.text} /></Pressable>
      </View>
    </View>
    <View style={[styles.tipCard, { backgroundColor: palette.card }]}><Ionicons name="leaf-outline" size={20} color={palette.muted} /><View style={{ flex: 1 }}><Label dark={dark}>A gentle reminder</Label><Text style={{ color: palette.muted, fontFamily: 'Manrope_400Regular', fontSize: 12, lineHeight: 19, marginTop: 4 }}>You don't have to do everything. Just the next thing.</Text></View></View>
  </ScrollView>;

  const renderCalendar = () => <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
    <View style={styles.topline}><Brand small /><Pressable onPress={() => setTab('Settings')}><Ionicons name="ellipsis-horizontal" size={22} color={palette.muted} /></Pressable></View>
    <Text style={[styles.pageTitle, { color: palette.text }]}>Calendar</Text><Text style={[styles.subtitle, { color: palette.muted }]}>Give your days a little intention.</Text>
    <View style={[styles.calendarCard, { backgroundColor: palette.card }]}>
      <View style={styles.monthHeader}><Text style={{ color: palette.text, fontFamily: 'Manrope_700Bold', fontSize: 15 }}>{monthName}</Text><View style={{ flexDirection: 'row', gap: 14 }}><Pressable onPress={() => { setMonthOffset(x => x-1); setSelectedDay(1); }}><Ionicons name="chevron-back" size={18} color={palette.muted} /></Pressable><Pressable onPress={() => { setMonthOffset(x => x+1); setSelectedDay(1); }}><Ionicons name="chevron-forward" size={18} color={palette.muted} /></Pressable></View></View>
      <View style={styles.calendarGrid}>{['S','M','T','W','T','F','S'].map((d,i)=><Text key={d+i} style={[styles.weekday, { color: palette.muted }]}>{d}</Text>)}
        {calendarCells.map((day,i)=><Pressable key={i} onPress={() => day && setSelectedDay(day)} style={[styles.dayCell, day===selectedDay && { backgroundColor: dark ? PAPER : INK }]}><Text style={{ color: day===selectedDay ? (dark ? INK : '#FFF') : day ? palette.text : 'transparent', fontFamily: day===selectedDay ? 'Manrope_700Bold' : 'Manrope_400Regular', fontSize: 12 }}>{day || '·'}</Text>{day && day % 5 === 0 && day !== selectedDay && <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: '#A69A86', marginTop: 2 }} />}</Pressable>)}
      </View>
    </View>
    <View style={styles.sectionHeader}><Label>{monthOffset===0 && selectedDay===now.getDate() ? 'Today' : `${shownMonth.toLocaleDateString('en-US',{month:'short'})} ${selectedDay}`}</Label><Text style={{ color: palette.muted, fontFamily: 'Manrope_500Medium', fontSize: 11 }}>{tasks.filter(t=>!t.done).length} to do</Text></View>
    <View style={[styles.panel, { backgroundColor: palette.card }]}>{tasks.filter(t=>!t.done).slice(0,4).map(task=><TaskRow key={task.id} task={task} onToggle={()=>toggleTask(task.id)} dark={dark} />)}{!tasks.some(t=>!t.done) && <Text style={{ color: palette.muted, padding: 20, fontFamily: 'Manrope_400Regular' }}>Nothing planned. Enjoy the space.</Text>}</View>
    <Button title="Add to your day" icon="add" onPress={() => setModal(true)} style={{ marginTop: 18 }} />
  </ScrollView>;

  const renderSettings = () => <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
    <View style={styles.topline}><Brand small /><View style={{ width: 28 }} /></View>
    <Text style={[styles.pageTitle, { color: palette.text }]}>Settings</Text><Text style={[styles.subtitle, { color: palette.muted }]}>Your space, your pace.</Text>
    <View style={[styles.profileCard, { backgroundColor: dark ? '#302F2A' : '#E7E0D5' }]}><View style={styles.largeAvatar}><Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 22, color: PAPER }}>{profile.name.slice(0,1).toUpperCase()}</Text></View><View style={{ flex: 1 }}><Text style={{ color: palette.text, fontFamily: 'Manrope_700Bold', fontSize: 16 }}>{profile.name}</Text><Text style={{ color: palette.muted, fontFamily: 'Manrope_400Regular', fontSize: 11, marginTop: 4 }}>{profile.email || 'Your personal space'}</Text></View><Pressable onPress={() => { setDraftName(profile.name); setDraftEmail(profile.email || ''); setProfileModal(true); }}><Ionicons name="create-outline" size={20} color={palette.muted} /></Pressable></View>
    <Text style={[styles.groupTitle, { color: palette.muted }]}>PREFERENCES</Text>
    <View style={[styles.settingsGroup, { backgroundColor: palette.card }]}>
      <View style={styles.settingRow}><View style={styles.settingIcon}><Ionicons name="moon-outline" size={18} color={palette.text} /></View><View style={{ flex: 1 }}><Text style={[styles.settingTitle,{color:palette.text}]}>Appearance</Text><Text style={[styles.settingSub,{color:palette.muted}]}>A softer dark theme</Text></View><Switch value={dark} onValueChange={setDark} trackColor={{ false: '#D5CFC5', true: '#79756A' }} thumbColor={dark ? PAPER : '#FFF'} /></View>
      <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: palette.line }]}><View style={styles.settingIcon}><Ionicons name="notifications-outline" size={18} color={palette.text} /></View><View style={{ flex: 1 }}><Text style={[styles.settingTitle,{color:palette.text}]}>Notifications</Text><Text style={[styles.settingSub,{color:palette.muted}]}>Gentle reminders for your day</Text></View><Switch value={notifications} onValueChange={setNotifications} trackColor={{ false: '#D5CFC5', true: '#79756A' }} thumbColor={notifications ? PAPER : '#FFF'} /></View>
    </View>
    <Text style={[styles.groupTitle, { color: palette.muted }]}>FOCUS</Text>
    <View style={[styles.settingsGroup, { backgroundColor: palette.card }]}>
      <Pressable onPress={() => { const n = focusLength === 25 ? 45 : focusLength === 45 ? 50 : 25; setFocusLength(n); setSecondsLeft(n*60); setRunning(false); }} style={styles.settingRow}><View style={styles.settingIcon}><Ionicons name="timer-outline" size={18} color={palette.text} /></View><View style={{ flex: 1 }}><Text style={[styles.settingTitle,{color:palette.text}]}>Focus duration</Text><Text style={[styles.settingSub,{color:palette.muted}]}>Tap to change session length</Text></View><Text style={{ color: palette.text, fontFamily: 'Manrope_700Bold', fontSize: 13 }}>{focusLength} min</Text><Ionicons name="chevron-forward" size={16} color={palette.muted} /></Pressable>
      <Pressable onPress={() => { Alert.alert('Your data stays yours', 'Your profile, tasks, and preferences are stored locally on this device. There is no cloud account connected.'); }} style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: palette.line }]}><View style={styles.settingIcon}><Ionicons name="shield-checkmark-outline" size={18} color={palette.text} /></View><View style={{ flex: 1 }}><Text style={[styles.settingTitle,{color:palette.text}]}>Privacy & security</Text><Text style={[styles.settingSub,{color:palette.muted}]}>Local-first by design</Text></View><Ionicons name="chevron-forward" size={16} color={palette.muted} /></Pressable>
    </View>
    <Text style={[styles.localNote, { color: palette.muted }]}>Your days, stored on this device. No account to remember, no cloud sync.</Text>
    <Pressable onPress={() => Alert.alert('Reset Ouren?', 'This removes your local profile and preferences from this device.', [{text:'Cancel',style:'cancel'},{text:'Reset',style:'destructive',onPress:async()=>{await AsyncStorage.removeItem(STORE_KEY);setProfile(null);setTasks(initialTasks);setDark(false);setNotifications(true);setDraftName('');setDraftEmail('');}}])} style={{ alignSelf: 'center', padding: 16 }}><Text style={{ color: '#9A6D61', fontFamily: 'Manrope_600SemiBold', fontSize: 12 }}>Reset local data</Text></Pressable>
  </ScrollView>;

  return <View style={{ flex: 1, backgroundColor: palette.bg }}>
    <ExpoStatusBar style={dark ? 'light' : 'dark'} />
    <View style={{ flex: 1 }}>
      {tab === 'Home' && renderHome()}
      {tab === 'Tasks' && renderTasks()}
      {tab === 'Focus' && renderFocus()}
      {tab === 'Calendar' && renderCalendar()}
      {tab === 'Settings' && renderSettings()}
    </View>
    <View style={[styles.tabBar, { backgroundColor: palette.card, borderTopColor: palette.line }]}>
      {navItems.map(item => <Pressable key={item.key} onPress={() => setTab(item.key)} style={styles.tabItem}>
        <Ionicons name={item.icon} size={21} color={tab === item.key ? palette.text : palette.muted} />
        <Text style={{ color: tab === item.key ? palette.text : palette.muted, fontFamily: tab === item.key ? 'Manrope_700Bold' : 'Manrope_500Medium', fontSize: 9, marginTop: 4 }}>{item.key}</Text>
        {tab === item.key && <View style={{ height: 2, width: 16, borderRadius: 2, backgroundColor: palette.text, marginTop: 4 }} />}
      </Pressable>)}
      <Pressable onPress={() => setTab('Settings')} style={styles.tabItem}><Ionicons name="person-circle-outline" size={21} color={tab === 'Settings' ? palette.text : palette.muted} /><Text style={{ color: tab === 'Settings' ? palette.text : palette.muted, fontFamily: 'Manrope_500Medium', fontSize: 9, marginTop: 4 }}>Profile</Text>{tab === 'Settings' && <View style={{ height: 2, width: 16, borderRadius: 2, backgroundColor: palette.text, marginTop: 4 }} />}</Pressable>
    </View>

    <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalShade}><Pressable style={StyleSheet.absoluteFill} onPress={() => setModal(false)} /><View style={[styles.modalCard, { backgroundColor: palette.card }]}>
        <View style={styles.modalHandle} /><View style={styles.modalTitleRow}><Text style={{ color: palette.text, fontFamily: 'Manrope_700Bold', fontSize: 22 }}>A new intention.</Text><Pressable onPress={() => setModal(false)}><Ionicons name="close" size={23} color={palette.muted} /></Pressable></View>
        <Text style={{ color: palette.muted, fontFamily: 'Manrope_400Regular', fontSize: 12, marginBottom: 18 }}>Keep it simple. Start where you are.</Text>
        <TextInput value={draftTask} onChangeText={setDraftTask} placeholder="What would you like to do?" placeholderTextColor="#A6A096" style={styles.field} autoFocus />
        <Text style={{ color: palette.muted, fontFamily: 'Manrope_700Bold', fontSize: 10, letterSpacing: 1, marginTop: 12, marginBottom: 10 }}>CATEGORY</Text>
        <View style={styles.pills}>{['Focus','Growth','Health','Planning'].map(cat=><Pressable key={cat} onPress={()=>setDraftCategory(cat)} style={[styles.pill,{backgroundColor:draftCategory===cat?(dark?'#555249':'#D8D0C4'):palette.bg}]}><Text style={{ color: palette.text, fontFamily: 'Manrope_600SemiBold', fontSize: 11 }}>{cat}</Text></Pressable>)}</View>
        <Button title="Save task" icon="checkmark" onPress={addTask} style={{ marginTop: 18 }} />
      </View></KeyboardAvoidingView>
    </Modal>

    <Modal visible={profileModal} transparent animationType="fade" onRequestClose={() => setProfileModal(false)}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalShade}><Pressable style={StyleSheet.absoluteFill} onPress={() => setProfileModal(false)} /><View style={[styles.modalCard,{backgroundColor:palette.card}]}>
        <View style={styles.modalTitleRow}><Text style={{color:palette.text,fontFamily:'Manrope_700Bold',fontSize:22}}>Your profile</Text><Pressable onPress={()=>setProfileModal(false)}><Ionicons name="close" size={23} color={palette.muted}/></Pressable></View>
        <TextInput value={draftName} onChangeText={setDraftName} placeholder="Your name" placeholderTextColor="#A6A096" style={styles.field}/>
        <TextInput value={draftEmail} onChangeText={setDraftEmail} placeholder="Email (optional)" placeholderTextColor="#A6A096" keyboardType="email-address" autoCapitalize="none" style={[styles.field,{marginTop:10}]}/>
        <Button title="Save changes" onPress={()=>{if(!draftName.trim())return;setProfile({name:draftName.trim(),email:draftEmail.trim()});setProfileModal(false);}} style={{marginTop:16}}/>
      </View></KeyboardAvoidingView>
    </Modal>
  </View>;
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 22, paddingTop: 24, paddingBottom: 30 },
  topline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#B6A995', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFDF8', fontFamily: 'Manrope_700Bold', fontSize: 13 },
  hero: { height: 235, borderRadius: 27, overflow: 'hidden', marginBottom: 25 },
  heroGradient: { flex: 1, justifyContent: 'flex-end', padding: 22, borderRadius: 27 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  panel: { borderRadius: 22, paddingHorizontal: 16, paddingTop: 2, overflow: 'hidden' },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 15, borderBottomWidth: 1 },
  check: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.4, borderColor: '#A8A196', alignItems: 'center', justifyContent: 'center' },
  taskTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 12 },
  taskDetail: { fontFamily: 'Manrope_400Regular', fontSize: 10, marginTop: 4 },
  struck: { textDecorationLine: 'line-through', opacity: .55 },
  viewAll: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  progressCard: { marginTop: 18, borderRadius: 22, padding: 18, flexDirection: 'row', alignItems: 'center' },
  progressRing: { width: 66, height: 66, borderWidth: 4, borderColor: '#A9A092', borderRadius: 33, alignItems: 'center', justifyContent: 'center' },
  button: { minHeight: 51, borderRadius: 15, paddingHorizontal: 19, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  buttonText: { fontFamily: 'Manrope_700Bold', fontSize: 12 },
  tabBar: { height: 75, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 10, paddingBottom: 8 },
  tabItem: { alignItems: 'center', justifyContent: 'center', minWidth: 48 },
  pageTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 31, letterSpacing: -1.2, marginTop: 5 },
  subtitle: { fontFamily: 'Manrope_400Regular', fontSize: 12, marginTop: 5, marginBottom: 22 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  roundButton: { width: 39, height: 39, borderRadius: 20, borderWidth: 1, borderColor: LINE, alignItems: 'center', justifyContent: 'center' },
  addTask: { marginTop: 15, borderWidth: 1, borderStyle: 'dashed', borderRadius: 17, padding: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  timerCard: { marginTop: 12, borderRadius: 28, padding: 20, alignItems: 'center' },
  modePills: { flexDirection: 'row', gap: 6, alignSelf: 'center' },
  modePill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12 },
  timerCircle: { width: 238, height: 238, borderRadius: 119, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginTop: 22 },
  timerAction: { width: 43, height: 43, borderRadius: 22, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  playButton: { width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center' },
  tipCard: { marginTop: 17, borderRadius: 18, padding: 17, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  calendarCard: { borderRadius: 22, padding: 18, marginTop: 2 },
  monthHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 19 },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  weekday: { width: '14.2857%', textAlign: 'center', fontFamily: 'Manrope_600SemiBold', fontSize: 10, paddingBottom: 10 },
  dayCell: { width: '14.2857%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 18, marginBottom: 3 },
  profileCard: { borderRadius: 22, padding: 17, flexDirection: 'row', alignItems: 'center', gap: 13, marginTop: 2, marginBottom: 28 },
  largeAvatar: { width: 49, height: 49, borderRadius: 25, backgroundColor: '#918574', alignItems: 'center', justifyContent: 'center' },
  groupTitle: { fontFamily: 'Manrope_700Bold', fontSize: 10, letterSpacing: 1.4, marginBottom: 10, marginTop: 5 },
  settingsGroup: { borderRadius: 20, paddingHorizontal: 14, marginBottom: 22 },
  settingRow: { minHeight: 71, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  settingIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(140,130,115,.12)' },
  settingTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 12 },
  settingSub: { fontFamily: 'Manrope_400Regular', fontSize: 10, marginTop: 4 },
  localNote: { fontFamily: 'Manrope_400Regular', fontSize: 11, lineHeight: 18, textAlign: 'center', marginHorizontal: 20, marginTop: 2, marginBottom: 10 },
  field: { borderWidth: 1, borderColor: LINE, borderRadius: 14, paddingHorizontal: 15, paddingVertical: 14, fontFamily: 'Manrope_400Regular', fontSize: 13, color: INK, backgroundColor: '#F8F5EF' },
  modalShade: { flex: 1, backgroundColor: 'rgba(18,17,15,.45)', justifyContent: 'flex-end' },
  modalCard: { paddingHorizontal: 23, paddingTop: 13, paddingBottom: 34, borderTopLeftRadius: 27, borderTopRightRadius: 27 },
  modalHandle: { width: 39, height: 4, borderRadius: 3, backgroundColor: '#C8C1B6', alignSelf: 'center', marginBottom: 21 },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
});
