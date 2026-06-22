// Reading Drill App v1.0
// Features: Dashboard + Practice + Add Content + Checkin Calendar
// Stack: React/Vite + GAS + Google Sheets
// Repo: steventeng1226-collab/reading-drill

import { useState, useEffect, useCallback } from "react";

// ── Config ─────────────────────────────────────────────────────────────────
const GAS_URL = "https://script.google.com/macros/s/AKfycbz_c8MiMg3MmTc2ZYfe9MCKHVDbOdwPCoc-pmclsRxjCexm8j7WumETp7ULfHoSFwME/exec";
const VERSION = "v1.0";

// ── GAS API ────────────────────────────────────────────────────────────────
async function gasCall(payload) {
  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────
function today() {
  return new Date().toISOString().split("T")[0];
}
function formatDate(d) {
  const [y, m, day] = d.split("-");
  return `${m}/${day}`;
}
function getDaysInMonth(y, m) {
  return new Date(y, m + 1, 0).getDate();
}
function getFirstDay(y, m) {
  return new Date(y, m, 1).getDay();
}

// ── Design Tokens ──────────────────────────────────────────────────────────
const C = {
  bg: "#F7F6F2",
  card: "#FFFFFF",
  primary: "#2A5C0E",
  primaryLight: "#4A8A1E",
  primaryBg: "#EBF3E4",
  text: "#1A1A1A",
  textMid: "#555",
  textLight: "#999",
  border: "#E5E3DC",
  danger: "#C0392B",
};

// ── Icons ──────────────────────────────────────────────────────────────────
const Ico = {
  home: (a) => <svg width={a||22} height={a||22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  book: (a) => <svg width={a||22} height={a||22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  plus: (a) => <svg width={a||22} height={a||22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
  cal: (a) => <svg width={a||22} height={a||22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  check: (a) => <svg width={a||20} height={a||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  fire: () => <span style={{fontSize:18}}>🔥</span>,
  back: (a) => <svg width={a||20} height={a||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  trash: (a) => <svg width={a||16} height={a||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
};

// ── Shared Components ──────────────────────────────────────────────────────
function Card({ children, style }) {
  return (
    <div style={{
      background: C.card, borderRadius: 16,
      boxShadow: "0 1px 8px rgba(0,0,0,0.07)",
      padding: 16, ...style
    }}>{children}</div>
  );
}

function PrimaryBtn({ children, onClick, disabled, style }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: "100%", padding: "15px", border: "none", borderRadius: 14,
      background: disabled ? "#CCC" : `linear-gradient(135deg, ${C.primary}, ${C.primaryLight})`,
      color: "#fff", fontSize: 16, fontWeight: 700, cursor: disabled ? "default" : "pointer",
      boxShadow: disabled ? "none" : "0 4px 14px rgba(42,92,14,0.3)",
      letterSpacing: "0.03em", ...style
    }}>{children}</button>
  );
}

function PageHeader({ title, sub, onBack }) {
  return (
    <div style={{
      padding: "16px 20px 12px",
      background: C.card,
      borderBottom: `1px solid ${C.border}`,
      display: "flex", alignItems: "center", gap: 10
    }}>
      {onBack && (
        <button onClick={onBack} style={{
          border: "none", background: "none", cursor: "pointer",
          color: C.primary, padding: 4, display: "flex"
        }}>{Ico.back(22)}</button>
      )}
      <div>
        {sub && <div style={{ fontSize: 12, color: C.textLight, fontWeight: 500, letterSpacing: "0.05em", marginBottom: 2 }}>{sub}</div>}
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{title}</div>
      </div>
    </div>
  );
}

// ── Tab: 首頁 Dashboard ────────────────────────────────────────────────────
function HomeTab({ data, onGoTo }) {
  const { streak, monthDone, monthTotal, totalQuotes, todayContent, todayChecked } = data;

  return (
    <div style={{ flex: 1, overflowY: "auto", background: C.bg, padding: "20px 16px", display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Hero streak banner */}
      <div style={{
        background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryLight} 100%)`,
        borderRadius: 20, padding: "20px 22px",
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginBottom: 4, letterSpacing: "0.05em" }}>連續練習</div>
          <div style={{ fontSize: 38, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{streak} 天</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 4 }}>保持下去！</div>
        </div>
        <div style={{ fontSize: 56 }}>🔥</div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Card style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: C.primary }}>{monthDone}</div>
          <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>本月打卡天數</div>
        </Card>
        <Card style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: C.primary }}>{totalQuotes}</div>
          <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>累積金句</div>
        </Card>
      </div>

      {/* Today status */}
      <Card>
        <div style={{ fontSize: 12, color: C.textLight, fontWeight: 600, letterSpacing: "0.05em", marginBottom: 10 }}>今日狀態</div>
        {todayContent ? (
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>{todayContent.title}</div>
            <div style={{ fontSize: 13, color: C.textMid, marginBottom: 12 }}>{todayContent.pages}</div>
            {todayChecked ? (
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: C.primaryBg, borderRadius: 10, padding: "10px 14px",
                color: C.primary, fontWeight: 600, fontSize: 14
              }}>
                {Ico.check(16)} 今日已完成打卡
              </div>
            ) : (
              <PrimaryBtn onClick={() => onGoTo("practice")}>開始今日練習</PrimaryBtn>
            )}
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 14, color: C.textMid, marginBottom: 12 }}>今天還沒有練習材料</div>
            <PrimaryBtn onClick={() => onGoTo("add")}>＋ 新增今日內容</PrimaryBtn>
          </div>
        )}
      </Card>

      {/* Version */}
      <div style={{ textAlign: "center", fontSize: 11, color: C.textLight }}>{VERSION}</div>
    </div>
  );
}

// ── Tab: 今日練習 ──────────────────────────────────────────────────────────
function PracticeTab({ data, onCheckin, checkedIn }) {
  const [fontSize, setFontSize] = useState(19);
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);

  const content = data.todayContent;

  if (!content) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, background: C.bg }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📖</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8 }}>今天還沒有練習材料</div>
        <div style={{ fontSize: 14, color: C.textMid }}>請先到「新增」頁面輸入今日內容</div>
      </div>
    );
  }

  const handleCheckin = () => {
    if (note.trim()) {
      onCheckin(note.trim());
    } else {
      setShowNote(true);
    }
  };

  const handleConfirmCheckin = () => {
    onCheckin(note.trim());
    setNoteSaved(true);
    setShowNote(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.bg }}>
      <PageHeader
        sub={`今日練習 · ${formatDate(today())}`}
        title={content.title}
      />

      {/* Font size control */}
      <div style={{
        padding: "8px 20px", background: C.card,
        borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ fontSize: 13, color: C.textMid }}>{content.pages}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, color: C.textLight }}>字體</span>
          <button onClick={() => setFontSize(f => Math.max(14, f - 2))}
            style={{ border: `1px solid ${C.border}`, background: C.bg, borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontSize: 14, color: C.textMid }}>A−</button>
          <button onClick={() => setFontSize(f => Math.min(30, f + 2))}
            style={{ border: `1px solid ${C.border}`, background: C.bg, borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontSize: 18, color: C.textMid, fontWeight: 600 }}>A+</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px 16px" }}>
        {content.text.split("\n\n").filter(p => p.trim()).map((p, i) => (
          <p key={i} style={{
            fontSize, lineHeight: 1.9, color: "#222",
            marginBottom: 28,
            fontFamily: "'Georgia', 'Noto Serif TC', 'PingFang TC', serif",
            letterSpacing: "0.03em",
          }}>{p.trim()}</p>
        ))}
      </div>

      {/* Note input */}
      {showNote && (
        <div style={{ padding: "12px 20px", background: C.card, borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 13, color: C.textMid, marginBottom: 8 }}>今天練習的感受（選填，可直接略過）</div>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="例：今天複述時自然用了『當機立斷』"
            style={{
              width: "100%", padding: "10px 14px", border: `1px solid ${C.border}`,
              borderRadius: 10, fontSize: 14, lineHeight: 1.6,
              fontFamily: "inherit", background: C.bg, boxSizing: "border-box",
              outline: "none", color: C.text, resize: "none", height: 72
            }}
          />
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button onClick={handleConfirmCheckin} style={{
              flex: 1, padding: "12px", border: "none", borderRadius: 12,
              background: `linear-gradient(135deg, ${C.primary}, ${C.primaryLight})`,
              color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer"
            }}>打卡完成</button>
            <button onClick={() => { setNote(""); setShowNote(false); onCheckin(""); }} style={{
              padding: "12px 16px", border: `1px solid ${C.border}`,
              borderRadius: 12, background: C.bg, fontSize: 14, cursor: "pointer", color: C.textMid
            }}>略過</button>
          </div>
        </div>
      )}

      {/* Bottom bar */}
      {!showNote && (
        <div style={{ padding: "14px 20px 28px", background: C.card, borderTop: `1px solid ${C.border}` }}>
          {checkedIn ? (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              background: C.primaryBg, borderRadius: 14, padding: "15px",
              color: C.primary, fontWeight: 700, fontSize: 16
            }}>
              {Ico.check(18)} 今日已完成打卡！
            </div>
          ) : (
            <PrimaryBtn onClick={handleCheckin}>完成今日練習 ✓</PrimaryBtn>
          )}
        </div>
      )}
    </div>
  );
}

// ── Tab: 新增內容 ──────────────────────────────────────────────────────────
function AddTab({ onSaved }) {
  const [title, setTitle] = useState("");
  const [pages, setPages] = useState("");
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!title.trim()) { setError("請輸入書名"); return; }
    if (!text.trim()) { setError("請輸入練習內容"); return; }
    setError("");
    setSaving(true);
    const result = await gasCall({
      action: "addContent",
      date: today(),
      title: title.trim(),
      pages: pages.trim(),
      text: text.trim(),
    });
    setSaving(false);
    if (result.success) {
      onSaved({ date: today(), title: title.trim(), pages: pages.trim(), text: text.trim() });
      setTitle(""); setPages(""); setText("");
    } else {
      setError("儲存失敗，請再試一次");
    }
  };

  const inputStyle = {
    width: "100%", padding: "12px 14px", border: `1px solid ${C.border}`,
    borderRadius: 12, fontSize: 15, background: C.card, boxSizing: "border-box",
    outline: "none", color: C.text, fontFamily: "inherit"
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.bg }}>
      <PageHeader sub="新增今日材料" title="輸入練習內容" />

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 14 }}>

        <Card>
          <div style={{ fontSize: 13, color: C.textMid, marginBottom: 6, fontWeight: 600 }}>書名 *</div>
          <input
            value={title} onChange={e => setTitle(e.target.value)}
            placeholder="例：讀人"
            style={inputStyle}
          />
        </Card>

        <Card>
          <div style={{ fontSize: 13, color: C.textMid, marginBottom: 6, fontWeight: 600 }}>頁數</div>
          <input
            value={pages} onChange={e => setPages(e.target.value)}
            placeholder="例：第 24–27 頁"
            style={inputStyle}
          />
        </Card>

        <Card>
          <div style={{ fontSize: 13, color: C.textMid, marginBottom: 6, fontWeight: 600 }}>練習內容 *</div>
          <div style={{ fontSize: 12, color: C.textLight, marginBottom: 8 }}>從書中複製文字貼上，段落之間空一行</div>
          <textarea
            value={text} onChange={e => setText(e.target.value)}
            placeholder="貼上今日練習段落..."
            style={{
              ...inputStyle, resize: "vertical", minHeight: 200,
              lineHeight: 1.7, fontSize: 15
            }}
          />
        </Card>

        {error && (
          <div style={{ fontSize: 13, color: C.danger, textAlign: "center" }}>{error}</div>
        )}

        <PrimaryBtn onClick={handleSave} disabled={saving}>
          {saving ? "儲存中…" : "儲存為今日練習材料"}
        </PrimaryBtn>

        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}

// ── Tab: 打卡記錄 ──────────────────────────────────────────────────────────
function CalendarTab({ checkinDates, streak, monthDone }) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const days = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDay(viewYear, viewMonth);
  const doneSet = new Set(
    checkinDates
      .filter(d => {
        const [y, m] = d.split("-").map(Number);
        return y === viewYear && m === viewMonth + 1;
      })
      .map(d => parseInt(d.split("-")[2]))
  );

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);

  const todayDay = now.getDate();
  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();

  const monthNames = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.bg }}>
      <PageHeader sub="練習紀錄" title="打卡月曆" />

      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          <Card style={{
            background: `linear-gradient(135deg, ${C.primary}, ${C.primaryLight})`,
            textAlign: "center"
          }}>
            <div style={{ fontSize: 30, fontWeight: 800, color: "#fff" }}>{streak}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>連續天數 🔥</div>
          </Card>
          <Card style={{ textAlign: "center" }}>
            <div style={{ fontSize: 30, fontWeight: 800, color: C.primary }}>{monthDone}</div>
            <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>本月完成</div>
          </Card>
        </div>

        {/* Month nav */}
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <button onClick={() => {
              if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
              else setViewMonth(m => m - 1);
            }} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 20, color: C.primary, padding: 4 }}>‹</button>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>
              {viewYear}年 {monthNames[viewMonth]}
            </div>
            <button onClick={() => {
              if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
              else setViewMonth(m => m + 1);
            }} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 20, color: C.primary, padding: 4 }}>›</button>
          </div>

          {/* Weekday headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 6 }}>
            {["日","一","二","三","四","五","六"].map(d => (
              <div key={d} style={{ textAlign: "center", fontSize: 12, color: C.textLight, fontWeight: 600, padding: "2px 0" }}>{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
            {cells.map((d, i) => {
              if (!d) return <div key={i} />;
              const done = doneSet.has(d);
              const isToday = isCurrentMonth && d === todayDay;
              return (
                <div key={i} style={{
                  aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: "50%", fontSize: 13, fontWeight: done ? 700 : 400,
                  background: done ? (isToday ? C.primary : C.primaryBg) : "transparent",
                  color: done ? (isToday ? "#fff" : C.primary) : isToday ? C.primary : C.textMid,
                  border: isToday && !done ? `2px solid ${C.primary}` : "2px solid transparent",
                }}>
                  {done ? "✓" : d}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("home");
  const [loading, setLoading] = useState(true);

  // App state
  const [todayContent, setTodayContent] = useState(null);
  const [todayChecked, setTodayChecked] = useState(false);
  const [checkinDates, setCheckinDates] = useState([]);
  const [totalQuotes, setTotalQuotes] = useState(0);

  // Load data from GAS
  const loadData = useCallback(async () => {
    setLoading(true);
    const result = await gasCall({ action: "getData", date: today() });
    if (result.success) {
      setTodayContent(result.todayContent || null);
      setTodayChecked(result.todayChecked || false);
      setCheckinDates(result.checkinDates || []);
      setTotalQuotes(result.totalQuotes || 0);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Compute stats
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthDone = checkinDates.filter(d => d.startsWith(thisMonth)).length;
  const monthTotal = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  // Streak calculation
  const streak = (() => {
    const sorted = [...checkinDates].sort().reverse();
    let count = 0;
    let checkDate = new Date();
    for (const d of sorted) {
      const dd = new Date(d + "T00:00:00");
      const diff = Math.round((checkDate - dd) / 86400000);
      if (diff === 0 || diff === 1) { count++; checkDate = dd; }
      else break;
    }
    return count;
  })();

  const dashData = { streak, monthDone, monthTotal, totalQuotes, todayContent, todayChecked };

  const handleCheckin = async (note) => {
    const result = await gasCall({ action: "checkin", date: today(), note });
    if (result.success) {
      setTodayChecked(true);
      setCheckinDates(prev => [...new Set([...prev, today()])]);
    }
  };

  const handleContentSaved = (content) => {
    setTodayContent(content);
    setTab("practice");
  };

  const tabs = [
    { id: "home",     label: "首頁",   icon: Ico.home },
    { id: "practice", label: "練習",   icon: Ico.book },
    { id: "add",      label: "新增",   icon: Ico.plus },
    { id: "calendar", label: "打卡",   icon: Ico.cal  },
  ];

  if (loading) {
    return (
      <div style={{
        maxWidth: 430, margin: "0 auto", height: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: C.bg, flexDirection: "column", gap: 16
      }}>
        <div style={{ fontSize: 40 }}>📖</div>
        <div style={{ fontSize: 16, color: C.textMid, fontWeight: 600 }}>Reading Drill</div>
        <div style={{ fontSize: 13, color: C.textLight }}>載入中…</div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: 430, margin: "0 auto", height: "100vh",
      display: "flex", flexDirection: "column",
      fontFamily: "'system-ui', '-apple-system', 'PingFang TC', 'Noto Sans TC', sans-serif",
      background: C.bg, overflow: "hidden",
    }}>
      {/* Content area */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {tab === "home"     && <HomeTab data={dashData} onGoTo={setTab} />}
        {tab === "practice" && <PracticeTab data={dashData} onCheckin={handleCheckin} checkedIn={todayChecked} />}
        {tab === "add"      && <AddTab onSaved={handleContentSaved} />}
        {tab === "calendar" && <CalendarTab checkinDates={checkinDates} streak={streak} monthDone={monthDone} />}
      </div>

      {/* Bottom nav */}
      <div style={{
        display: "flex", background: C.card,
        borderTop: `1px solid ${C.border}`,
        paddingBottom: "env(safe-area-inset-bottom, 6px)"
      }}>
        {tabs.map(t => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              padding: "10px 4px 8px", border: "none", background: "none", cursor: "pointer",
              color: active ? C.primary : "#AAAAAA", gap: 3, position: "relative"
            }}>
              {active && (
                <div style={{
                  position: "absolute", top: 0, left: "25%", right: "25%",
                  height: 3, background: C.primary, borderRadius: "0 0 3px 3px"
                }} />
              )}
              <div style={{ transform: active ? "scale(1.15)" : "scale(1)", transition: "transform 0.15s" }}>
                {t.icon(22)}
              </div>
              <span style={{ fontSize: 11, fontWeight: active ? 700 : 400 }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
