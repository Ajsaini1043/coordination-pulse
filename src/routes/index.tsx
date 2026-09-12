import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Activity, CheckCircle2, Loader2, MoonStar, Plus, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CategoryColumn, ItemCard } from "@/components/pulse/CategoryColumn";
import { analysisSchema, type PulseAnalysis } from "@/lib/pulse-types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pulse — Coordination Intelligence for Conversations" },
      {
        name: "description",
        content:
          "Paste a meeting transcript or chat thread and Pulse surfaces what has gone dark, what is in motion, and what is confirmed.",
      },
      { property: "og:title", content: "Pulse — Coordination Intelligence" },
      {
        property: "og:description",
        content:
          "AI analysis that turns conversations into three clear signals: Gone Dark, In Motion, Confirmed.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PulseDashboard,
});

const PLACEHOLDER = `Paste a conversation, meeting transcript, or chat thread…

Aman: I think we should migrate the payment service to Stripe next month.
Neha: That sounds good. Let's do it after the current release is stable.
Rahul: What about the existing payment failure issue?`;

function PulseDashboard() {
  const [conversation, setConversation] = useState("");
  const [analysis, setAnalysis] = useState<PulseAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const goneDark = analysis?.goneDark ?? [];
  const inMotion = analysis?.inMotion ?? [];
  const confirmed = analysis?.confirmed ?? [];

  async function runAnalysis() {
    if (!conversation.trim()) {
      setError("Please enter a conversation to analyze.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation }),
      });

      let payload: unknown = null;
      const contentType = res.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        try {
          payload = await res.json();
        } catch {
          payload = null;
        }
      }

      const body = (payload ?? {}) as { success?: boolean; error?: unknown; data?: unknown };

      if (!res.ok || body.success !== true) {
        const message =
          typeof body.error === "string" && body.error.trim()
            ? body.error
            : "Analysis failed. Please check the AI configuration and try again.";
        setError(message);
        return;
      }

      const parsed = analysisSchema.safeParse(body.data);
      if (!parsed.success) {
        setError("Analysis returned an unexpected format. Please try again.");
        return;
      }
      setAnalysis(parsed.data);
    } catch {
      setError("Could not reach the analysis service. Please check your connection and retry.");
    } finally {
      setIsLoading(false);
    }
  }

  function resetAll() {
    setConversation("");
    setAnalysis(null);
    setError(null);
    setIsLoading(false);
    setConfirmOpen(false);
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  function handleNewConversation() {
    if (analysis) {
      setConfirmOpen(true);
      return;
    }
    resetAll();
  }

  const hasResults = analysis !== null;
  const total = goneDark.length + inMotion.length + confirmed.length;

  return (
    <div className="pulse-grid-bg min-h-screen">
      <header className="border-b border-border/70">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
              <Activity className="size-4" />
            </span>
            <div>
              <h1 className="font-display text-lg leading-none font-semibold tracking-tight">
                Pulse
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">Coordination intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground tabular-nums">
            {hasResults ? `${total} signals detected` : "Awaiting conversation"}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-xl border border-border bg-card/60 p-5 backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold tracking-[0.14em] uppercase">Conversation</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Pulse reads the whole thread to find owners, gaps, and decisions.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNewConversation}
              disabled={isLoading || (!conversation && !hasResults)}
            >
              <Plus className="size-4" />
              New Conversation
            </Button>
          </div>

          <Textarea
            ref={textareaRef}
            value={conversation}
            onChange={(e) => {
              setConversation(e.target.value);
              if (error) setError(null);
            }}
            placeholder={PLACEHOLDER}
            rows={10}
            className="mt-4 resize-y bg-surface font-mono text-sm leading-relaxed"
          />

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p
              className="text-xs text-destructive"
              role={error ? "alert" : undefined}
              aria-live="polite"
            >
              {error}
            </p>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {conversation.trim().length} chars
              </span>
              <Button onClick={runAnalysis} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    Analysis
                  </>
                )}
              </Button>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <CategoryColumn
            title="Gone Dark"
            description="Unresolved, unanswered or abandoned items with no clear owner."
            accent="dark"
            count={goneDark.length}
            icon={<MoonStar className="size-4" />}
            isEmpty={goneDark.length === 0}
            empty={isLoading ? "Analyzing…" : "Nothing has gone dark yet."}
          >
            {goneDark.map((entry, i) => (
              <ItemCard
                key={`gd-${i}`}
                accent="dark"
                person={entry.person}
                item={entry.item}
                note={entry.reason}
                noteLabel="Why"
                confidence={entry.confidence}
              />
            ))}
          </CategoryColumn>

          <CategoryColumn
            title="In Motion"
            description="Active tasks with a clear owner moving forward."
            accent="motion"
            count={inMotion.length}
            icon={<Zap className="size-4" />}
            isEmpty={inMotion.length === 0}
            empty={isLoading ? "Analyzing…" : "No active tasks detected yet."}
          >
            {inMotion.map((entry, i) => (
              <ItemCard
                key={`im-${i}`}
                accent="motion"
                person={entry.person}
                item={entry.item}
                note={entry.context}
                noteLabel="Context"
                confidence={entry.confidence}
              />
            ))}
          </CategoryColumn>

          <CategoryColumn
            title="Confirmed"
            description="Agreed decisions, facts and commitments."
            accent="confirmed"
            count={confirmed.length}
            icon={<CheckCircle2 className="size-4" />}
            isEmpty={confirmed.length === 0}
            empty={isLoading ? "Analyzing…" : "No confirmed decisions detected yet."}
          >
            {confirmed.map((entry, i) => (
              <ItemCard
                key={`cf-${i}`}
                accent="confirmed"
                person={entry.person}
                item={entry.item}
                note={entry.context}
                noteLabel="Context"
                confidence={entry.confidence}
              />
            ))}
          </CategoryColumn>
        </div>
      </main>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start a new conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear the current conversation and analysis results.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={resetAll}>Start New</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
