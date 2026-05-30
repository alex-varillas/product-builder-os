"use client";

import { BuildHoursCard } from "./BuildHoursCard";
import { MiniMonthCalendar } from "./MiniMonthCalendar";
import { FocusGoalCard } from "./FocusGoalCard";
import { StreakCard } from "./StreakCard";
import { BuildLogPreviewCard } from "./BuildLogPreviewCard";
import { ProjectFocusRow, DayFocusRow, RecentLogEntry } from "@/lib/analytics";
import { useAppLang } from "./AppLanguageContext";

interface HomeViewProps {
  userName: string;
  weekFocus: ProjectFocusRow[];
  focusByDay: DayFocusRow[];
  todayFocusMin: number;
  dailyGoalMin: number;
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  onOpenProject: (projectId: string) => void;
  onOpenAllProjects: () => void;
  onOpenPomodoro: () => void;
  blockCountsByDay: Map<string, number>;
  onSaveGoal: (newGoalMin: number) => void;
  recentLog: RecentLogEntry[];
}

function greeting(name: string, lang: string): string {
  const hour = new Date().getHours();
  if (lang === "es") {
    const part = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";
    return `${part}, ${name}`;
  }
  const part = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return `${part}, ${name}`;
}

export function HomeView({
  userName,
  weekFocus,
  focusByDay,
  todayFocusMin,
  dailyGoalMin,
  selectedDate,
  onSelectDate,
  onOpenProject,
  onOpenAllProjects,
  onOpenPomodoro,
  blockCountsByDay,
  onSaveGoal,
  recentLog,
}: HomeViewProps) {
  const { t, lang } = useAppLang();

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="home-view">
      {/* Greeting */}
      <div className="home-greeting">
        <div>
          <h1 className="home-greeting-title">{greeting(userName, lang)}</h1>
          <p className="home-greeting-sub">{t.home.subtitle}</p>
        </div>
        <span className="home-date">{dateStr}</span>
      </div>

      {/* Main grid */}
      <div className="home-grid">
        {/* Build Hours */}
        <div className="home-cell home-cell-bh">
          <BuildHoursCard
            rows={weekFocus}
            onOpenPomodoro={onOpenPomodoro}
          />
        </div>

        {/* Mini Calendar */}
        <div className="home-cell home-cell-cal">
          <div className="home-card">
            <div className="home-card-title">{t.home.buildingDaysTitle}</div>
            <MiniMonthCalendar
              focusByDay={focusByDay}
              selectedDate={selectedDate}
              onSelectDate={onSelectDate}
              blockCountsByDay={blockCountsByDay}
            />
          </div>
        </div>

        {/* Focus Goal + Streak */}
        <div className="home-cell home-cell-fg">
          <div className="home-fg-stack">
            <div className="home-fg-focus">
              <FocusGoalCard todayMin={todayFocusMin} goalMin={dailyGoalMin} onSaveGoal={onSaveGoal} />
            </div>
            <div className="home-fg-streak">
              <StreakCard focusByDay={focusByDay} />
            </div>
          </div>
        </div>

        {/* Recent Build Log */}
        <div className="home-cell home-cell-ap">
          <BuildLogPreviewCard
            entries={recentLog}
            onViewAll={onOpenAllProjects}
          />
        </div>
      </div>
    </div>
  );
}
