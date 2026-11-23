export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-8 text-center text-sm text-muted-foreground sm:flex-row sm:text-left">
        <p>
          &copy; 2026 InterviewAI. Practice technical interviews with structured
          AI feedback.
        </p>
        <p className="text-xs">Built for developers preparing for hiring loops.</p>
      </div>
    </footer>
  );
}