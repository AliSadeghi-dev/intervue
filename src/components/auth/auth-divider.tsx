export function AuthDivider() {
  return (
    <div className="relative flex items-center gap-3 py-1">
      <div className="h-px flex-1 bg-border" aria-hidden />
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        or
      </span>
      <div className="h-px flex-1 bg-border" aria-hidden />
    </div>
  );
}
